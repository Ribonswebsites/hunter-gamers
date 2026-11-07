import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';

const _home = 'https://hunter-gamers.pages.dev/';
const _bg = Color(0xFF0B0809);

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: _bg,
    systemNavigationBarColor: _bg,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarIconBrightness: Brightness.light,
  ));
  runApp(const HunterApp());
}

class HunterApp extends StatelessWidget {
  const HunterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Hunter Gamers',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: _bg,
        colorScheme: const ColorScheme.dark(primary: Color(0xFFFB241C), surface: _bg),
      ),
      home: const HunterHome(),
    );
  }
}

class HunterHome extends StatefulWidget {
  const HunterHome({super.key});

  @override
  State<HunterHome> createState() => _HunterHomeState();
}

class _HunterHomeState extends State<HunterHome> {
  late final WebViewController _web;
  var _loading = true;
  var _failed = false;

  static const _agent =
      'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 HunterGameApp/4.1 (41)';

  @override
  void initState() {
    super.initState();
    _web = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(_bg)
      ..setUserAgent(_agent)
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (_) {
          if (mounted) setState(() { _loading = true; _failed = false; });
        },
        onPageFinished: (_) {
          if (mounted) setState(() => _loading = false);
        },
        onWebResourceError: (err) {
          if (err.isForMainFrame == true && mounted) setState(() { _loading = false; _failed = true; });
        },
        onNavigationRequest: (req) {
          final uri = Uri.tryParse(req.url);
          if (uri == null) return NavigationDecision.prevent;
          if (_onSite(uri)) return NavigationDecision.navigate;
          launchUrl(uri, mode: LaunchMode.externalApplication);
          return NavigationDecision.prevent;
        },
      ))
      ..loadRequest(Uri.parse(_home));
  }

  bool _onSite(Uri uri) {
    final host = uri.host.toLowerCase();
    return host == 'hunter-gamers.pages.dev' || host == 'ribonswebsites.github.io';
  }

  Future<void> _back() async {
    if (await _web.canGoBack()) {
      await _web.goBack();
      return;
    }
    SystemNavigator.pop();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _back();
      },
      child: Scaffold(
        backgroundColor: _bg,
        body: SafeArea(
          child: Stack(
            children: [
              WebViewWidget(controller: _web),
              if (_loading) const Center(child: CircularProgressIndicator(color: Color(0xFFFB241C))),
              if (_failed)
                Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('No connection', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 8),
                        const Text('Hunter Gamers needs the internet to load the shop.', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFFAE9DA1))),
                        const SizedBox(height: 16),
                        FilledButton(
                          style: FilledButton.styleFrom(backgroundColor: const Color(0xFFE01E17)),
                          onPressed: () => _web.loadRequest(Uri.parse(_home)),
                          child: const Text('Try again'),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
