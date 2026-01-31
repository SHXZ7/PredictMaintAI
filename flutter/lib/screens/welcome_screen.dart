import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:math' as math;
import 'login_screen.dart'; // Links to your Login Page
import 'dashboard_screen.dart'; // Links to Dashboard (for Guest)

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen>
    with TickerProviderStateMixin {
  late AnimationController _rotateController;
  late AnimationController _pulseController;

  // --- THEME COLORS (Matches Login & Dashboard) ---
  final Color _bgDeep = const Color(0xFF0A0B14);
  final Color _geminiBlue = const Color(0xFF3B82F6);
  final Color _accentCyan = const Color(0xFF22D3EE);
  final Color _textMain = const Color(0xFFE2E8F0);
  final Color _textDim = const Color(0xFF94A3B8);

  @override
  void initState() {
    super.initState();

    // 1. Controller for rotating gears
    _rotateController = AnimationController(
      duration: const Duration(seconds: 15),
      vsync: this,
    )..repeat();

    // 2. Controller for the "breathing" core glow
    _pulseController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _rotateController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bgDeep,
      body: Stack(
        alignment: Alignment.center,
        children: [
          // --- LAYER 1: BACKGROUND GRID ---
          CustomPaint(
            size: Size.infinite,
            painter: GridPainter(color: Colors.white.withOpacity(0.02)),
          ),

          // --- LAYER 2: THE ANIMATED MACHINE CORE ---
          Positioned(
            top: MediaQuery.of(context).size.height * 0.2,
            child: SizedBox(
              width: 320,
              height: 320,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Glow Effect Behind
                  AnimatedBuilder(
                    animation: _pulseController,
                    builder: (context, child) {
                      return Container(
                        width: 180 + (_pulseController.value * 30),
                        height: 180 + (_pulseController.value * 30),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: _geminiBlue.withOpacity(0.2),
                              blurRadius: 60,
                              spreadRadius: 10,
                            ),
                          ],
                        ),
                      );
                    },
                  ),

                  // Big Gear (Rotating Clockwise)
                  AnimatedBuilder(
                    animation: _rotateController,
                    builder: (_, child) {
                      return Transform.rotate(
                        angle: _rotateController.value * 2 * math.pi,
                        child: Icon(
                          Icons.settings,
                          size: 240,
                          color: Colors.white.withOpacity(0.03),
                        ),
                      );
                    },
                  ),

                  // Inner Gear (Rotating Counter-Clockwise)
                  AnimatedBuilder(
                    animation: _rotateController,
                    builder: (_, child) {
                      return Transform.rotate(
                        angle: -(_rotateController.value * 2 * math.pi),
                        child: Icon(
                          Icons.settings_outlined,
                          size: 160,
                          color: _geminiBlue.withOpacity(0.5),
                        ),
                      );
                    },
                  ),

                  // Central "Brain" (Static but glowing)
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: _bgDeep,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: _accentCyan.withOpacity(0.5),
                        width: 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: _accentCyan.withOpacity(0.2),
                          blurRadius: 20,
                        ),
                      ],
                    ),
                    child: Icon(
                      Icons.memory_rounded,
                      color: _textMain,
                      size: 40,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // --- LAYER 3: BOTTOM UI CONTENT ---
          Positioned(
            bottom: 50,
            left: 24,
            right: 24,
            child: Column(
              children: [
                // Status Badge
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: _geminiBlue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: _geminiBlue.withOpacity(0.3)),
                  ),
                  child: Text(
                    'SYSTEM ONLINE',
                    style: TextStyle(
                      color: _geminiBlue,
                      letterSpacing: 2,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Main Title
                Text(
                  'Predictive\nMaintenance AI',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.spaceMono(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: _textMain,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 16),

                // Subtitle
                Text(
                  'Real-time diagnostics and machine learning analytics for industrial hardware.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: _textDim, fontSize: 14, height: 1.5),
                ),
                const SizedBox(height: 48),

                // BUTTON 1: GET STARTED (To Login)
                Container(
                  width: double.infinity,
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [_geminiBlue, _accentCyan],
                    ),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: _geminiBlue.withOpacity(0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const LoginScreen(),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'GET STARTED',
                          style: GoogleFonts.spaceMono(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                            color: Colors.white,
                            letterSpacing: 1,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Icon(
                          Icons.arrow_forward,
                          size: 18,
                          color: Colors.white,
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // BUTTON 2: CONTINUE AS GUEST (To Dashboard)
                TextButton(
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const DashboardScreen(),
                      ),
                    );
                  },
                  child: Text(
                    'Continue as Guest',
                    style: GoogleFonts.spaceMono(
                      color: _textDim,
                      fontSize: 14,
                      decoration: TextDecoration.underline,
                      decorationColor: _textDim,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// --- BACKGROUND GRID PAINTER ---
class GridPainter extends CustomPainter {
  final Color color;
  GridPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1;

    // Draw vertical lines every 40 pixels
    for (double i = 0; i < size.width; i += 40) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    }
    // Draw horizontal lines every 40 pixels
    for (double i = 0; i < size.height; i += 40) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
