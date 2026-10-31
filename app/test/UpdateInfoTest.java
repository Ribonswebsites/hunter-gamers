import com.huntergame.app.UpdateInfo;
public class UpdateInfoTest { static int f=0; static void ok(boolean b,String m){System.out.println((b?"PASS ":"FAIL ")+m); if(!b)f++;}
 public static void main(String[] a){
  String j="{\n \"versionCode\": 3,\n \"versionName\": \"1.3\",\n \"apkUrl\": \"https://hunter-gamers.pages.dev/downloads/hunter-game.apk\",\n \"notes\": \"New \\\"games\\\"\"\n}";
  UpdateInfo i=UpdateInfo.parse(j);
  ok(i!=null&&i.versionCode==3&&"1.3".equals(i.versionName),"parse code/name");
  ok(i.notes.equals("New \"games\""),"parse escaped notes");
  ok(UpdateInfo.isNewer(i,2),"3 > installed 2 -> update");
  ok(!UpdateInfo.isNewer(i,3),"3 == installed 3 -> no update");
  ok(!UpdateInfo.isNewer(i,4),"3 < installed 4 -> no update");
  ok(UpdateInfo.parse("{\"versionCode\":5,\"apkUrl\":\"http://x/a.apk\"}")==null,"reject non-https apk");
  ok(UpdateInfo.parse("garbage")==null && UpdateInfo.parse(null)==null,"reject garbage/null");
  ok(UpdateInfo.parse("{\"versionCode\":12,\"apkUrl\":\"https://a/b.apk\"}").versionCode==12,"two-digit code, defaults");
  long H=3600000L;
  ok(UpdateInfo.shouldCheck(true,0,1,3*H),"launch always checks");
  ok(!UpdateInfo.shouldCheck(false,10*H,11*H,3*H),"resume after 1h skipped");
  ok(UpdateInfo.shouldCheck(false,10*H,13*H,3*H),"resume after 3h checks");
  ok(UpdateInfo.shouldCheck(false,10*H,5*H,3*H),"clock moved back -> checks");
  System.exit(f);
 }}
