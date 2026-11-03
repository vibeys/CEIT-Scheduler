package com.ceit.scheduler;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.LinkAddress;
import android.net.LinkProperties;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;

import org.json.JSONObject;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.List;

/** What the phone is connected to (Wi-Fi / Ethernet / mobile data) and keeping the app on the LAN. */
final class NetUtil {
    private NetUtil() { }

    private static ConnectivityManager cm(Context c) {
        return (ConnectivityManager) c.getSystemService(Context.CONNECTIVITY_SERVICE);
    }

    /** 3 = Ethernet, 2 = Wi-Fi, 1 = mobile data, 0 = none */
    private static int rank(ConnectivityManager cm, Network n) {
        NetworkCapabilities nc = cm.getNetworkCapabilities(n);
        if (nc == null) return 0;
        if (nc.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)) return 3;
        if (nc.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) return 2;
        if (nc.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)) return 1;
        return 0;
    }

    private static String firstIpv4(LinkProperties lp) {
        if (lp == null) return "";
        for (LinkAddress la : lp.getLinkAddresses()) {
            InetAddress a = la.getAddress();
            if (a instanceof Inet4Address && !a.isLoopbackAddress()) return a.getHostAddress();
        }
        return "";
    }

    /** JSON for the screens: {"type":"wifi","label":"Wi-Fi","ip":"192.168.1.35"} */
    static String infoJson(Context c) {
        String type = "none", label = "No network", ip = "";
        try {
            ConnectivityManager cm = cm(c);
            Network best = null;
            int top = 0;
            for (Network n : cm.getAllNetworks()) {
                int r = rank(cm, n);
                if (r > top) { top = r; best = n; }
            }
            if (top == 3) { type = "ethernet"; label = "Ethernet"; }
            else if (top == 2) { type = "wifi"; label = "Wi-Fi"; }
            else if (top == 1) { type = "mobile"; label = "Mobile data"; }
            if (best != null && top >= 2) ip = firstIpv4(cm.getLinkProperties(best));
            JSONObject o = new JSONObject();
            o.put("type", type); o.put("label", label); o.put("ip", ip);
            return o.toString();
        } catch (Exception e) {
            return "{\"type\":\"none\",\"label\":\"No network\",\"ip\":\"\"}";
        }
    }

    /** The phone's Wi-Fi / Ethernet networks as address + prefix (used to know where to look for the server). */
    static List<Lan.Net> lanNets(Context c) {
        List<Lan.Net> out = new ArrayList<Lan.Net>();
        try {
            ConnectivityManager cm = cm(c);
            for (Network n : cm.getAllNetworks()) {
                if (rank(cm, n) < 2) continue;
                LinkProperties lp = cm.getLinkProperties(n);
                if (lp == null) continue;
                for (LinkAddress la : lp.getLinkAddresses()) {
                    InetAddress a = la.getAddress();
                    if (a instanceof Inet4Address && !a.isLoopbackAddress()) out.add(new Lan.Net(a.getHostAddress(), la.getPrefixLength()));
                }
            }
        } catch (Exception e) { /* fall through */ }
        if (out.isEmpty()) out = Lan.localNets(false);
        return out;
    }

    /**
     * A school Wi-Fi often has no internet. Android then likes to send app traffic over mobile data instead,
     * and the school server cannot be reached. So the app is tied to the Wi-Fi / Ethernet network while one exists.
     */
    static void bindToLan(Context c) {
        try {
            ConnectivityManager cm = cm(c);
            Network best = null;
            int top = 1;
            for (Network n : cm.getAllNetworks()) {
                int r = rank(cm, n);
                if (r > top) { top = r; best = n; }
            }
            cm.bindProcessToNetwork(best); // null = back to normal
        } catch (Exception e) { /* ignore */ }
    }

    /** Re-tie the app to the LAN whenever Wi-Fi / Ethernet appears or disappears. */
    static List<ConnectivityManager.NetworkCallback> watch(final Context c) {
        List<ConnectivityManager.NetworkCallback> list = new ArrayList<ConnectivityManager.NetworkCallback>();
        int[] kinds = new int[] { NetworkCapabilities.TRANSPORT_WIFI, NetworkCapabilities.TRANSPORT_ETHERNET };
        for (int k : kinds) {
            ConnectivityManager.NetworkCallback cb = new ConnectivityManager.NetworkCallback() {
                @Override public void onAvailable(Network network) { bindToLan(c); }
                @Override public void onLost(Network network) { bindToLan(c); }
            };
            try {
                cm(c).registerNetworkCallback(new NetworkRequest.Builder().addTransportType(k).build(), cb);
                list.add(cb);
            } catch (Exception e) { /* ignore */ }
        }
        return list;
    }

    static void unwatch(Context c, List<ConnectivityManager.NetworkCallback> list) {
        for (ConnectivityManager.NetworkCallback cb : list) {
            try { cm(c).unregisterNetworkCallback(cb); } catch (Exception e) { /* ignore */ }
        }
    }
}
