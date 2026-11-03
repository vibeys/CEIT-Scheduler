package com.ceit.scheduler;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.ConnectException;
import java.net.HttpURLConnection;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.InterfaceAddress;
import java.net.NetworkInterface;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * Finds the CEIT Scheduler server on the Wi-Fi / LAN.
 * It asks http://IP:PORT/api/ping on every address of the network (TCP only).
 * Plain Java with no Android classes, so it can also be tested on a normal computer.
 */
public final class Lan {
    private Lan() { }

    public static final class Server {
        public String ip = "", name = "", serverId = "", version = "";
        public int port;
    }

    public static final class Probe {
        public Server server;
        public String error = "";
    }

    /** One of this device's own networks: address + prefix length (24 = 255.255.255.0). */
    public static final class Net {
        public final String ip;
        public final int prefix;
        public Net(String ip, int prefix) { this.ip = ip; this.prefix = prefix; }
    }

    // ---------------------------------------------------------------- one address
    public static Probe probe(String host, int port, int timeoutMs) {
        Probe p = new Probe();
        HttpURLConnection c = null;
        try {
            URL u = new URL("http://" + host + ":" + port + "/api/ping");
            c = (HttpURLConnection) u.openConnection();
            c.setConnectTimeout(timeoutMs);
            c.setReadTimeout(timeoutMs);
            c.setUseCaches(false);
            c.setInstanceFollowRedirects(false);
            c.setRequestProperty("Cache-Control", "no-store");
            if (c.getResponseCode() != 200) { p.error = "That is not a CEIT Scheduler server"; return p; }
            String body = read(c.getInputStream(), 4000);
            if (!body.contains("\"ceit-scheduler\"")) { p.error = "That is not a CEIT Scheduler server"; return p; }
            Server s = new Server();
            s.ip = host; s.port = port;
            s.serverId = field(body, "serverId");
            s.name = field(body, "name");
            s.version = field(body, "version");
            p.server = s;
        } catch (ConnectException e) {
            p.error = "Nothing is listening on that address and port";
        } catch (SocketTimeoutException e) {
            p.error = "No answer (timeout)";
        } catch (UnknownHostException e) {
            p.error = "Unknown address";
        } catch (Exception e) {
            p.error = "No answer";
        } finally {
            if (c != null) c.disconnect();
        }
        return p;
    }

    private static String read(InputStream in, int max) throws java.io.IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buf = new byte[1024];
        int n;
        while ((n = in.read(buf)) > 0 && out.size() < max) out.write(buf, 0, n);
        in.close();
        return out.toString("UTF-8");
    }

    /** Reads  "key":"value"  from a small flat JSON text. */
    static String field(String json, String key) {
        String k = "\"" + key + "\":\"";
        int i = json.indexOf(k);
        if (i < 0) return "";
        i += k.length();
        StringBuilder sb = new StringBuilder();
        for (; i < json.length(); i++) {
            char c = json.charAt(i);
            if (c == '\\' && i + 1 < json.length()) {
                char n = json.charAt(++i);
                if (n == 'u' && i + 4 < json.length()) {
                    try { sb.append((char) Integer.parseInt(json.substring(i + 1, i + 5), 16)); i += 4; } catch (Exception e) { /* skip */ }
                } else if (n == 'n') { sb.append(' '); }
                else { sb.append(n); }
            } else if (c == '"') { break; }
            else { sb.append(c); }
        }
        return sb.toString();
    }

    // ---------------------------------------------------------------- whole network
    public static boolean isPrivate(String ip) {
        return ip.startsWith("10.") || ip.startsWith("192.168.")
                || (ip.startsWith("172.") && ip.length() > 6 && inRange(ip.substring(4, ip.indexOf('.', 4)), 16, 31));
    }

    private static boolean inRange(String s, int lo, int hi) {
        try { int v = Integer.parseInt(s); return v >= lo && v <= hi; } catch (Exception e) { return false; }
    }

    /** This device's own IPv4 networks (used on a normal computer, and as a fallback on the phone). */
    public static List<Net> localNets(boolean allowAny) {
        List<Net> out = new ArrayList<Net>();
        try {
            Enumeration<NetworkInterface> e = NetworkInterface.getNetworkInterfaces();
            while (e != null && e.hasMoreElements()) {
                NetworkInterface ni = e.nextElement();
                if (!ni.isUp() || ni.isLoopback() || ni.isVirtual()) continue;
                for (InterfaceAddress ia : ni.getInterfaceAddresses()) {
                    InetAddress a = ia.getAddress();
                    if (!(a instanceof Inet4Address)) continue;
                    String ip = a.getHostAddress();
                    if (ip.startsWith("169.254.")) continue;
                    if (!allowAny && !isPrivate(ip)) continue;
                    out.add(new Net(ip, ia.getNetworkPrefixLength()));
                }
            }
        } catch (Exception e) { /* none */ }
        return out;
    }

    static long toLong(String ip) {
        String[] p = ip.split("\\.");
        long v = 0;
        for (int i = 0; i < 4; i++) v = (v << 8) | (Integer.parseInt(p[i]) & 255);
        return v;
    }

    static String toIp(long v) {
        return ((v >> 24) & 255) + "." + ((v >> 16) & 255) + "." + ((v >> 8) & 255) + "." + (v & 255);
    }

    /** Addresses to try: the whole /24 around each network (wider networks: the 2 neighbour blocks too). */
    public static List<String> candidates(List<Net> nets) {
        LinkedHashSet<String> out = new LinkedHashSet<String>();
        Set<String> own = new HashSet<String>();
        for (Net n : nets) own.add(n.ip);
        for (Net n : nets) {
            if (n.prefix < 8 || n.prefix > 30) continue;
            long base = toLong(n.ip);
            long mask = (0xFFFFFFFFL << (32 - n.prefix)) & 0xFFFFFFFFL;
            if (n.prefix > 24) { // small network: only its own range
                long net = base & mask, size = 1L << (32 - n.prefix);
                for (long k = 1; k < size - 1; k++) out.add(toIp(net + k));
                continue;
            }
            long b24 = base & 0xFFFFFF00L;
            long[] blocks = n.prefix < 24 ? new long[] { b24 - 256, b24, b24 + 256 } : new long[] { b24 };
            for (long b : blocks) {
                if (b < 0 || b > 0xFFFFFF00L) continue;
                for (int k = 1; k < 255; k++) out.add(toIp(b + k));
            }
        }
        out.removeAll(own);
        return new ArrayList<String>(out);
    }

    /** Looks for servers. 'first' = addresses to try before the rest (e.g. the saved server). */
    public static List<Server> scan(final int port, List<String> first, List<Net> nets, final int timeoutMs) {
        final LinkedHashSet<String> hosts = new LinkedHashSet<String>();
        if (first != null) for (String f : first) if (f != null && f.length() > 0) hosts.add(f);
        hosts.addAll(candidates(nets));
        final Map<String, List<Server>> groups = Collections.synchronizedMap(new LinkedHashMap<String, List<Server>>());
        ExecutorService ex = Executors.newFixedThreadPool(64);
        for (final String h : hosts) {
            ex.submit(new Runnable() {
                public void run() {
                    Probe p = probe(h, port, timeoutMs);
                    if (p.server == null) return;
                    String key = p.server.serverId.length() > 0 ? p.server.serverId : h;
                    synchronized (groups) {
                        List<Server> g = groups.get(key);
                        if (g == null) { g = new ArrayList<Server>(); groups.put(key, g); }
                        g.add(p.server);
                    }
                }
            });
        }
        ex.shutdown();
        try { ex.awaitTermination(25, TimeUnit.SECONDS); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        ex.shutdownNow();
        List<Server> out = new ArrayList<Server>();
        synchronized (groups) { for (List<Server> g : groups.values()) out.add(g.get(0)); }
        return out;
    }
}
