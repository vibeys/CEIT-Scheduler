import com.ceit.scheduler.Lan;
import java.util.*;

/** Runs the phone's server-finder on a normal computer against a real running server. */
public class LanTest {
    static int fails = 0;
    static void check(boolean ok, String what) { System.out.println((ok ? "  PASS " : "  FAIL ") + what); if (!ok) fails++; }

    public static void main(String[] a) {
        int port = Integer.parseInt(a[0]);
        Lan.Probe p = Lan.probe("127.0.0.1", port, 1500);
        check(p.server != null && p.server.serverId.length() >= 8 && p.server.name.length() > 0, "probe recognises the server and reads its id + name: " + (p.server == null ? p.error : p.server.name + " / " + p.server.serverId));
        Lan.Probe wrong = Lan.probe("127.0.0.1", 9, 800);
        check(wrong.server == null && wrong.error.contains("Nothing is listening"), "closed port gives a clear message: " + wrong.error);
        Lan.Probe none = Lan.probe("10.255.255.9", port, 800);
        check(none.server == null && none.error.length() > 0, "unreachable address gives a message: " + none.error);

        List<Lan.Net> nets = Lan.localNets(true);
        check(!nets.isEmpty(), "this computer has a network: " + (nets.isEmpty() ? "-" : nets.get(0).ip + "/" + nets.get(0).prefix));
        List<String> cand = Lan.candidates(Arrays.asList(new Lan.Net("192.168.1.35", 24)));
        check(cand.size() == 253 && cand.contains("192.168.1.20") && !cand.contains("192.168.1.35"), "a /24 network gives 253 addresses (own address left out)");
        check(Lan.candidates(Arrays.asList(new Lan.Net("10.0.5.9", 16))).size() == 3 * 254 - 1, "a wide network tries the 3 nearby blocks");
        check(Lan.candidates(Arrays.asList(new Lan.Net("192.168.1.9", 28))).size() == 13, "a small network only its own range (28 -> 13 other hosts)");
        check(Lan.isPrivate("192.168.0.4") && Lan.isPrivate("10.1.2.3") && Lan.isPrivate("172.20.0.1") && !Lan.isPrivate("172.40.0.1") && !Lan.isPrivate("8.8.8.8"), "private address check");

        long t = System.currentTimeMillis();
        // pretend to be a phone on the same network (another host address), so the server's own address is scanned
        String mine = nets.get(0).ip; Lan.Net phone = new Lan.Net(mine.substring(0, mine.lastIndexOf('.')) + ".77", nets.get(0).prefix);
        List<Lan.Server> found = Lan.scan(port, null, Arrays.asList(phone), 600);
        long ms = System.currentTimeMillis() - t;
        check(found.size() == 1 && found.get(0).serverId.equals(p.server.serverId) && found.get(0).port == port, "LAN scan finds exactly this server by itself (" + found.size() + " found in " + ms + " ms)");
        check(ms < 8000, "scan finishes quickly");
        System.out.println(fails == 0 ? "ALL PASSED" : (fails + " FAILED"));
        System.exit(fails == 0 ? 0 : 1);
    }
}
