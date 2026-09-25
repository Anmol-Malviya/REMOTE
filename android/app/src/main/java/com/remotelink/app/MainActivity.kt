package com.remotelink.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.remotelink.app.data.remote.SignalingClient
import com.remotelink.app.navigation.RemoteLinkNavGraph
import com.remotelink.app.security.TokenManager
import com.remotelink.app.service.WebRTCService
import com.remotelink.app.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val signalingClient = SignalingClient("wss://remote-xfam.onrender.com")
                val tokenManager = TokenManager(this@MainActivity.applicationContext)
                
                // Initialize Retrofit API Service
                val retrofit = retrofit2.Retrofit.Builder()
                    .baseUrl("https://remote-xfam.onrender.com")
                    .addConverterFactory(retrofit2.converter.gson.GsonConverterFactory.create())
                    .build()
                val apiService = retrofit.create(com.remotelink.app.data.remote.ApiService::class.java)
                
                // eglBase requires careful initialization in a real app, passing null here for structural placeholder
                val webRTCService = WebRTCService(
                    this@MainActivity.applicationContext,
                    org.webrtc.EglBase.create(),
                    onIceCandidate = { /* send via signaling */ },
                    onAddStream = { /* bind to UI */ }
                )
                
                return MainViewModel(signalingClient, tokenManager, webRTCService, apiService) as T
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    RemoteLinkNavGraph() // TODO: Pass viewModel to NavGraph
                }
            }
        }
    }
}
