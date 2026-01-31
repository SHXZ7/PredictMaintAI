import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'login_screen.dart'; // For Logout navigation

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  // --- THEME COLORS ---
  final Color _bgDeep = const Color(0xFF0A0B14);
  final Color _cardBg = const Color(0xFF151725);
  final Color _geminiBlue = const Color(0xFF3B82F6);
  final Color _accentCyan = const Color(0xFF22D3EE);
  final Color _textMain = const Color(0xFFE2E8F0);
  final Color _textDim = const Color(0xFF94A3B8);

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
        title: Text(
          'OPERATOR PROFILE',
          style: GoogleFonts.spaceMono(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            color: _textMain,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // --- 1. AVATAR & HEADER ---
            Center(
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Glowing Ring
                  Container(
                    width: 110,
                    height: 110,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: _geminiBlue.withOpacity(0.5)),
                      boxShadow: [
                        BoxShadow(
                          color: _geminiBlue.withOpacity(0.2),
                          blurRadius: 20,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                  ),
                  // Avatar Circle
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: _cardBg,
                      shape: BoxShape.circle,
                      image: const DecorationImage(
                        // Placeholder image (replace with asset if needed)
                        image: NetworkImage('https://i.pravatar.cc/300'),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  // Online Status Dot
                  Positioned(
                    bottom: 5,
                    right: 5,
                    child: Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: _bgDeep,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Container(
                          width: 14,
                          height: 14,
                          decoration: const BoxDecoration(
                            color: Colors.greenAccent,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            Text(
              '-------',
              style: GoogleFonts.spaceMono(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Senior Field Engineer | ID: OP-449-X',
              style: TextStyle(color: _textDim, fontSize: 12),
            ),

            const SizedBox(height: 32),

            // --- 2. PERFORMANCE STATS ROW ---
            Row(
              children: [
                Expanded(child: _buildStatCard('TASKS', '142', _geminiBlue)),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard('EFFICIENCY', '98%', _accentCyan),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard('HOURS', '1,204', Colors.orange),
                ),
              ],
            ),

            const SizedBox(height: 32),

            // --- 3. DETAILED INFO CARD ---
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: _cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.05)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'PERSONNEL DETAILS',
                    style: GoogleFonts.spaceMono(
                      color: _textDim,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 20),
                  _buildDetailRow(Icons.email_outlined, 'EMAIL', '------'),
                  const Divider(color: Colors.white10, height: 30),
                  _buildDetailRow(Icons.phone_outlined, 'CONTACT', '------'),
                  const Divider(color: Colors.white10, height: 30),
                  _buildDetailRow(Icons.business, 'DEPARTMENT', '---------'),
                  const Divider(color: Colors.white10, height: 30),
                  _buildDetailRow(
                    Icons.verified_user_outlined,
                    'CLEARANCE',
                    'Level 3 Access',
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),

            // --- 4. LOGOUT BUTTON ---
            SizedBox(
              width: double.infinity,
              height: 50,
              child: OutlinedButton(
                onPressed: () {
                  // Navigate back to Login and remove all previous routes
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const LoginScreen(),
                    ),
                    (route) => false,
                  );
                },
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: Colors.red.withOpacity(0.5)),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  'TERMINATE SESSION',
                  style: GoogleFonts.spaceMono(
                    color: Colors.redAccent,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  // --- HELPER WIDGETS ---

  Widget _buildStatCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: _cardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: GoogleFonts.spaceMono(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, color: _geminiBlue, size: 20),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(color: _textDim, fontSize: 10, letterSpacing: 1),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: GoogleFonts.spaceMono(color: _textMain, fontSize: 14),
            ),
          ],
        ),
      ],
    );
  }
}
