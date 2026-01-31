import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dashboard_screen.dart'; // Navigate to Dashboard
import 'signup_screen.dart'; // Navigate to Sign Up

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // --- THEME COLORS ---
  final Color _bgDeep = const Color(0xFF0A0B14);
  final Color _cardBg = const Color(0xFF151725);
  final Color _geminiBlue = const Color(0xFF3B82F6);
  final Color _accentCyan = const Color(0xFF22D3EE);
  final Color _textMain = const Color(0xFFE2E8F0);
  final Color _textDim = const Color(0xFF94A3B8);

  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

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
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. HEADER ICON (Glowing Lock)
              Center(
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: _cardBg,
                    shape: BoxShape.circle,
                    border: Border.all(color: _geminiBlue.withOpacity(0.5)),
                    boxShadow: [
                      BoxShadow(
                        color: _geminiBlue.withOpacity(0.2),
                        blurRadius: 30,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: Icon(
                    Icons.lock_outline_rounded,
                    size: 32,
                    color: _geminiBlue,
                  ),
                ),
              ),
              const SizedBox(height: 40),

              // 2. TEXT HEADER
              Text(
                'AUTHENTICATION',
                textAlign: TextAlign.center,
                style: GoogleFonts.spaceMono(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: _textMain,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Enter credentials to initialize session',
                textAlign: TextAlign.center,
                style: TextStyle(color: _textDim, fontSize: 12),
              ),
              const SizedBox(height: 50),

              // 3. INPUT FIELDS
              _buildDarkTextField(
                controller: _emailController,
                label: 'ENGINEER ID',
                icon: Icons.badge_outlined,
                obscure: false,
              ),
              const SizedBox(height: 20),
              _buildDarkTextField(
                controller: _passwordController,
                label: 'ACCESS KEY',
                icon: Icons.password_outlined,
                obscure: true,
              ),

              // Forgot Password Link
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {},
                  child: Text(
                    'Forgot Key?',
                    style: TextStyle(
                      color: _accentCyan.withOpacity(0.7),
                      fontSize: 12,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 40),

              // 4. LOGIN BUTTON (Neon Gradient)
              Container(
                height: 55,
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [_geminiBlue, _accentCyan]),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: _geminiBlue.withOpacity(0.4),
                      blurRadius: 20,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: () {
                    // Navigate to Dashboard
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const DashboardScreen(),
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
                        'INITIALIZE',
                        style: GoogleFonts.spaceMono(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Colors.white,
                          letterSpacing: 2,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(
                        Icons.arrow_forward,
                        color: Colors.white,
                        size: 18,
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // 5. SIGN UP LINK (New Unit Registration)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'New unit? ',
                    style: TextStyle(color: _textDim, fontSize: 12),
                  ),
                  GestureDetector(
                    onTap: () {
                      // Navigate to Signup Screen
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const SignupScreen(),
                        ),
                      );
                    },
                    child: Text(
                      'Register Access',
                      style: GoogleFonts.spaceMono(
                        color: _geminiBlue,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        decoration: TextDecoration.underline,
                        decorationColor: _geminiBlue,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  // --- HELPER WIDGET FOR DARK INPUTS ---
  Widget _buildDarkTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required bool obscure,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.spaceMono(
            color: _textDim,
            fontSize: 10,
            fontWeight: FontWeight.bold,
            letterSpacing: 1,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          obscureText: obscure,
          style: TextStyle(color: _textMain),
          cursorColor: _accentCyan,
          decoration: InputDecoration(
            filled: true,
            fillColor: _cardBg,
            prefixIcon: Icon(icon, color: _textDim, size: 20),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.white.withOpacity(0.05)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: _geminiBlue, width: 1.5),
            ),
            contentPadding: const EdgeInsets.symmetric(vertical: 18),
          ),
        ),
      ],
    );
  }
}
