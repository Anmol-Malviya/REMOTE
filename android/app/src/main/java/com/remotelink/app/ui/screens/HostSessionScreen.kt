package com.remotelink.app.ui.screens

import android.graphics.Bitmap
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.remotelink.app.utils.QRCodeGenerator
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Composable
fun HostSessionScreen(
    onSessionEnded: () -> Unit
) {
    var qrBitmap by remember { mutableStateOf<Bitmap?>(null) }
    
    LaunchedEffect(Unit) {
        // Simulate generating a pairing token
        val fakePairingPayload = "{\"version\":1,\"pairingId\":\"test-id\",\"token\":\"test-token\"}"
        withContext(Dispatchers.IO) {
            qrBitmap = QRCodeGenerator.generateQRCode(fakePairingPayload, 512)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Host a Session",
            style = MaterialTheme.typography.headlineMedium
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Box(
            modifier = Modifier
                .size(250.dp)
        ) {
            qrBitmap?.let {
                Image(
                    bitmap = it.asImageBitmap(),
                    contentDescription = "Pairing QR Code",
                    modifier = Modifier.fillMaxSize()
                )
            } ?: CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Text(
            text = "Have the remote user scan this code to begin.",
            textAlign = TextAlign.Center,
            style = MaterialTheme.typography.bodyMedium
        )
        
        Spacer(modifier = Modifier.height(48.dp))
        
        Button(
            onClick = onSessionEnded,
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
            modifier = Modifier.fillMaxWidth().height(56.dp)
        ) {
            Text("Cancel Session")
        }
    }
}
