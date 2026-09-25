package com.remotelink.app.data.remote

import android.util.Log
import okhttp3.*
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class SignalingClient(private val serverUrl: String) {
    private var webSocket: WebSocket? = null
    private val client = OkHttpClient.Builder()
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    var onMessageReceived: ((JSONObject) -> Unit)? = null
    var onConnected: (() -> Unit)? = null
    var onDisconnected: (() -> Unit)? = null

    private var reconnectAttempt = 0
    private val maxReconnectAttempts = 5
    private var isReconnecting = false

    fun connect(token: String, deviceId: String) {
        val request = Request.Builder()
            .url(serverUrl)
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d("SignalingClient", "Connected to signaling server")
                reconnectAttempt = 0
                isReconnecting = false
                onConnected?.invoke()

                // Authenticate
                val authMsg = JSONObject().apply {
                    put("type", "AUTH")
                    put("token", token)
                    put("deviceId", deviceId)
                }
                webSocket.send(authMsg.toString())
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                Log.d("SignalingClient", "Received message: $text")
                try {
                    val json = JSONObject(text)
                    onMessageReceived?.invoke(json)
                } catch (e: Exception) {
                    Log.e("SignalingClient", "Error parsing message", e)
                }
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                Log.d("SignalingClient", "Disconnected from signaling server")
                onDisconnected?.invoke()
                attemptReconnect(token, deviceId)
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e("SignalingClient", "WebSocket failure", t)
                onDisconnected?.invoke()
                attemptReconnect(token, deviceId)
            }
        })
    }
    
    private fun attemptReconnect(token: String, deviceId: String) {
        if (isReconnecting || reconnectAttempt >= maxReconnectAttempts) return
        
        isReconnecting = true
        reconnectAttempt++
        
        val backoffMillis = (1000 * Math.pow(2.0, reconnectAttempt.toDouble())).toLong()
        Log.d("SignalingClient", "Attempting to reconnect in ${backoffMillis}ms (Attempt $reconnectAttempt)")
        
        Thread {
            Thread.sleep(backoffMillis)
            isReconnecting = false
            connect(token, deviceId)
        }.start()
    }

    fun sendMessage(message: JSONObject) {
        webSocket?.send(message.toString())
    }

    fun disconnect() {
        webSocket?.close(1000, "User disconnected")
        webSocket = null
    }
}
