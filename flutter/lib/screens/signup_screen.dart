import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dashboard_screen.dart'; // Navigate to dashboard on success
import 'login_screen.dart'; // Navigate back to login if needed

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  // --- THEME COLORS (Consistent with other screens) ---
  final Color _bgDeep = const Color(0xFF0A0B14);
  final Color _cardBg = const Color(0xFF151725);
  final Color _geminiBlue = const Color(0xFF3B82F6);
  final Color _accentCyan = const Color(0xFF22D3EE);
  final Color _textMain = const Color(0xFFE2E8F0);
  final Color _textDim = const Color(0xFF94A3B8);

  // Text Controllers
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();

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
              // 1. HEADER ICON (Glowing Person Add)
              Center(
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: _cardBg,
                    shape: BoxShape.circle,
                    border: Border.all(color: _accentCyan.withOpacity(0.5)),
                    boxShadow: [
                      BoxShadow(
                        color: _accentCyan.withOpacity(0.2),
                        blurRadius: 30,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: Icon(
                    Icons.person_add_alt_1_outlined,
                    size: 32,
                    color: _accentCyan,
                  ),
                ),
              ),
              const SizedBox(height: 30),

              // 2. TEXT HEADER
              Text(
                'NEW OPERATOR',
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
                'Register credentials for system access',
                textAlign: TextAlign.center,
                style: TextStyle(color: _textDim, fontSize: 12),
              ),
              const SizedBox(height: 40),

              // 3. INPUT FIELDS
              _buildDarkTextField(
                controller: _nameController,
                label: 'FULL NAME',
                icon: Icons.person_outline,
                obscure: false,
              ),
              const SizedBox(height: 20),
              _buildDarkTextField(
                controller: _emailController,
                label: 'ENGINEER EMAIL',
                icon: Icons.alternate_email,
                obscure: false,
              ),
              const SizedBox(height: 20),
              _buildDarkTextField(
                controller: _passwordController,
                label: 'CREATE ACCESS KEY',
                icon: Icons.lock_outline,
                obscure: true,
              ),
              const SizedBox(height: 20),
              _buildDarkTextField(
                controller: _confirmController,
                label: 'CONFIRM KEY',
                icon: Icons.lock_reset,
                obscure: true,
              ),

              const SizedBox(height: 40),

              // 4. REGISTER BUTTON (Cyan Gradient)
              Container(
                height: 55,
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [_accentCyan, _geminiBlue]),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: _accentCyan.withOpacity(0.4),
                      blurRadius: 20,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: () {
                    // Logic to create account, then go to Dashboard
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const DashboardScreen(),
                      ),
                      (route) =>
                          false, // Clears back stack so they can't go back to signup
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
                        'REGISTER UNIT',
                        style: GoogleFonts.spaceMono(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color:
                              _bgDeep, // Dark text on bright button for contrast
                          letterSpacing: 1.5,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(Icons.arrow_forward, color: _bgDeep, size: 18),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // 5. LOGIN LINK
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Already have credentials? ',
                    style: TextStyle(color: _textDim, fontSize: 12),
                  ),
                  GestureDetector(
                    onTap: () {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const LoginScreen(),
                        ),
                      );
                    },
                    child: Text(
                      'System Login',
                      style: GoogleFonts.spaceMono(
                        color: _accentCyan,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        decoration: TextDecoration.underline,
                        decorationColor: _accentCyan,
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

  // --- HELPER WIDGET (Reused from Login for consistency) ---
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
              borderSide: BorderSide(color: _accentCyan, width: 1.5),
            ),
            contentPadding: const EdgeInsets.symmetric(vertical: 18),
          ),
        ),
      ],
    );
  }
}
