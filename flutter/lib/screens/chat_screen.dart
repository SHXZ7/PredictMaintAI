import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  // ===================================================
  // 👇 PASTE YOUR OPENROUTER KEY BELOW 👇
  // ===================================================
  static const apiKey =
      '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';
  // ===================================================

  final Color _bgDeep = const Color(0xFF0A0B14);
  final Color _cardBg = const Color(0xFF151725);
  final Color _geminiBlue = const Color(0xFF3B82F6);
  final Color _textMain = const Color(0xFFE2E8F0);
  final Color _textDim = const Color(0xFF94A3B8);
  final Color _botGreen = const Color(0xFF10B981);

  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  final List<Map<String, dynamic>> _messages = [
    {
      "isUser": false,
      "text":
          "FDU-9000 Online via OpenRouter.\n\nAccessing Fleet Telemetry... Ready.",
    },
  ];

  bool _isTyping = false;

  Future<String> _getOpenRouterResponse(String userText) async {
    if (apiKey.contains('PASTE_YOUR')) {
      return "Error: API Key missing.";
    }

    final systemPrompt =
        'You are FDU-9000, an industrial AI assistant. Current Status: 5000 Units Active. Temp 64C. Keep answers technical and brief.';

    try {
      final response = await http.post(
        Uri.parse('https://openrouter.ai/api/v1/chat/completions'),
        headers: {
          'Authorization': 'Bearer $apiKey',
          'Content-Type': 'application/json',
          // 'HTTP-Referer': 'https://your-site.com', // Optional
          // 'X-Title': 'Your App Name', // Optional
        },
        body: jsonEncode({
          // --- FIX IS HERE: Switched to a reliable, standard model ID ---
          "model": "google/gemini-2.0-flash-001",
          "messages": [
            {"role": "system", "content": systemPrompt},
            {"role": "user", "content": userText},
          ],
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['choices'][0]['message']['content'] ??
            "No response content.";
      } else {
        return "Error ${response.statusCode}: ${response.body}";
      }
    } catch (e) {
      return "Connection Failure: $e";
    }
  }

  void _handleSend() async {
    if (_controller.text.isEmpty) return;

    String userText = _controller.text;
    _controller.clear();

    setState(() {
      _messages.add({"isUser": true, "text": userText});
      _isTyping = true;
    });
    _scrollToBottom();

    String botResponse = await _getOpenRouterResponse(userText);

    if (mounted) {
      setState(() {
        _isTyping = false;
        _messages.add({"isUser": false, "text": botResponse});
      });
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bgDeep,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: _textDim, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.router, color: _botGreen, size: 20),
            const SizedBox(width: 10),
            Text(
              'OPENROUTER LINK',
              style: GoogleFonts.spaceMono(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                letterSpacing: 2,
                color: _textMain,
              ),
            ),
          ],
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(20),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg['isUser'];
                return Align(
                  alignment: isUser
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(16),
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.75,
                    ),
                    decoration: BoxDecoration(
                      color: isUser ? _geminiBlue.withOpacity(0.2) : _cardBg,
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(12),
                        topRight: const Radius.circular(12),
                        bottomLeft: isUser
                            ? const Radius.circular(12)
                            : Radius.zero,
                        bottomRight: isUser
                            ? Radius.zero
                            : const Radius.circular(12),
                      ),
                      border: Border.all(
                        color: isUser
                            ? _geminiBlue.withOpacity(0.5)
                            : Colors.white.withOpacity(0.1),
                      ),
                    ),
                    child: Text(
                      msg['text'],
                      style: TextStyle(color: _textMain, height: 1.4),
                    ),
                  ),
                );
              },
            ),
          ),
          if (_isTyping)
            Padding(
              padding: const EdgeInsets.only(left: 20, bottom: 10),
              child: Text(
                "Transmitting...",
                style: GoogleFonts.spaceMono(fontSize: 10, color: _textDim),
              ),
            ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _cardBg,
              border: Border(
                top: BorderSide(color: Colors.white.withOpacity(0.05)),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    style: TextStyle(color: _textMain),
                    decoration: InputDecoration(
                      hintText: "Enter command...",
                      hintStyle: TextStyle(color: _textDim),
                      filled: true,
                      fillColor: _bgDeep,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(30),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 14,
                      ),
                    ),
                    onSubmitted: (_) => _handleSend(),
                  ),
                ),
                const SizedBox(width: 12),
                FloatingActionButton(
                  onPressed: _handleSend,
                  backgroundColor: _geminiBlue,
                  mini: true,
                  child: const Icon(Icons.send, size: 18),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
