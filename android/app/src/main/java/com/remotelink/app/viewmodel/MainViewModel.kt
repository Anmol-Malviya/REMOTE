package com.remotelink.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.remotelink.app.data.remote.SignalingClient
import com.remotelink.app.security.TokenManager
import com.remotelink.app.service.WebRTCService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.json.JSONObject

enum class AppState {
    IDLE, CONNECTING, CONNECTED, HOSTING, ERROR
}

class MainViewModel(
    private val signalingClient: SignalingClient,
    private val tokenManager: TokenManager,
    private val webRTCService: WebRTCService
) : ViewModel() {

    private val _appState = MutableStateFlow(AppState.IDLE)
    val appState: StateFlow<AppState> = _appState.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    init {
        setupSignaling()
    }

    private fun setupSignaling() {
        signalingClient.onMessageReceived = { json ->
            viewModelScope.launch {
                handleSignalingMessage(json)
            }
        }
        
        signalingClient.onConnected = {
            if (_appState.value == AppState.CONNECTING) {
                _appState.value = AppState.IDLE // Authenticated, ready to pair
            }
        }
        
        signalingClient.onDisconnected = {
            if (_appState.value == AppState.CONNECTED || _appState.value == AppState.HOSTING) {
                _appState.value = AppState.ERROR
                _errorMessage.value = "Disconnected from signaling server"
            }
        }
    }

    fun startHosting() {
        _appState.value = AppState.HOSTING
        // Generate pairing ID via ApiService and start waiting for WebSocket pair request
    }

    fun processScannedQR(qrData: String) {
        _appState.value = AppState.CONNECTING
        try {
            val json = JSONObject(qrData)
            val pairingId = json.getString("pairingId")
            val token = json.getString("token")
            
            // Join pairing session via ApiService
            // If successful, negotiate WebRTC SDP Offer via WebSocket
            
        } catch (e: Exception) {
            _appState.value = AppState.ERROR
            _errorMessage.value = "Invalid QR Code"
        }
    }

    private fun handleSignalingMessage(json: JSONObject) {
        when (json.optString("type")) {
            "PAIR_REQUEST" -> {
                // Show approval dialog to Host
            }
            "SDP_OFFER" -> {
                // Pass to WebRTCService to setRemoteDescription and generate Answer
            }
            "SDP_ANSWER" -> {
                // Pass to WebRTCService to setRemoteDescription
            }
            "ICE_CANDIDATE" -> {
                // Pass to WebRTCService to addIceCandidate
            }
            "SESSION_ENDED" -> {
                endSession()
            }
        }
    }

    fun endSession() {
        webRTCService.close()
        _appState.value = AppState.IDLE
    }
}
