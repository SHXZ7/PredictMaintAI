import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// IMPORTANT: These imports assume your files are inside a folder named 'screens'.
// If your files are just inside 'lib' (not in a folder), remove 'screens/' from these lines.
import 'screens/welcome_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Predictive Maintenance AI',
      debugShowCheckedModeBanner: false,

      // Global Dark Theme Configuration
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(
          0xFF0A0B14,
        ), // Matches your deep background
        primaryColor: const Color(0xFF3B82F6), // Gemini Blue
        // This ensures the default font for the whole app is Space Mono
        textTheme: GoogleFonts.spaceMonoTextTheme(
          Theme.of(context).textTheme.apply(
            bodyColor: const Color(0xFFE2E8F0),
            displayColor: Colors.white,
          ),
        ),

        useMaterial3: true,
      ),

      // The entry point of your application
      home: const WelcomeScreen(),
    );
  }
}
