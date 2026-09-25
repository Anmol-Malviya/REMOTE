package com.remotelink.app.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.remotelink.app.ui.screens.HomeScreen
import com.remotelink.app.ui.screens.HostSessionScreen
import com.remotelink.app.ui.screens.QRScannerScreen
import com.remotelink.app.ui.screens.RemoteControlScreen

@Composable
fun RemoteLinkNavGraph() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "home") {
        composable("home") {
            HomeScreen(
                onNavigateToScanner = { navController.navigate("scanner") },
                onNavigateToHost = { navController.navigate("host") }
            )
        }
        
        composable("scanner") {
            QRScannerScreen(
                onPairingSuccess = { qrData -> 
                    // Handle pairing logic with QR Data here
                    navController.navigate("remote_control") 
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable("host") {
            HostSessionScreen(
                onSessionEnded = { navController.popBackStack("home", false) }
            )
        }

        composable("remote_control") {
            RemoteControlScreen(
                onEndSession = { navController.popBackStack("home", false) }
            )
        }
    }
}
