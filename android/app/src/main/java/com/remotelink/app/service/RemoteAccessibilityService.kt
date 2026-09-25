package com.remotelink.app.service

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.view.accessibility.AccessibilityEvent
import org.json.JSONObject

class RemoteAccessibilityService : AccessibilityService() {

    override fun onServiceConnected() {
        super.onServiceConnected()
        // Wait for WebRTC DataChannel messages to simulate gestures
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Not used, but required to override
    }

    override fun onInterrupt() {
        // Service interrupted
    }

    fun handleRemoteEvent(json: JSONObject) {
        when (json.optString("type")) {
            "tap" -> {
                val x = json.optDouble("x")
                val y = json.optDouble("y")
                performTap(x.toFloat(), y.toFloat())
            }
            "swipe" -> {
                val startX = json.optDouble("startX").toFloat()
                val startY = json.optDouble("startY").toFloat()
                val endX = json.optDouble("endX").toFloat()
                val endY = json.optDouble("endY").toFloat()
                val duration = json.optLong("duration", 400L)
                performSwipe(startX, startY, endX, endY, duration)
            }
            "back" -> performGlobalAction(GLOBAL_ACTION_BACK)
            "home" -> performGlobalAction(GLOBAL_ACTION_HOME)
            "recents" -> performGlobalAction(GLOBAL_ACTION_RECENTS)
        }
    }

    private fun performTap(normX: Float, normY: Float) {
        val width = resources.displayMetrics.widthPixels
        val height = resources.displayMetrics.heightPixels
        
        val x = normX * width
        val y = normY * height

        val path = Path().apply { moveTo(x, y) }
        val stroke = GestureDescription.StrokeDescription(path, 0, 100)
        val gesture = GestureDescription.Builder().addStroke(stroke).build()
        
        dispatchGesture(gesture, null, null)
    }

    private fun performSwipe(nStartX: Float, nStartY: Float, nEndX: Float, nEndY: Float, duration: Long) {
        val width = resources.displayMetrics.widthPixels
        val height = resources.displayMetrics.heightPixels
        
        val path = Path().apply {
            moveTo(nStartX * width, nStartY * height)
            lineTo(nEndX * width, nEndY * height)
        }
        val stroke = GestureDescription.StrokeDescription(path, 0, duration)
        val gesture = GestureDescription.Builder().addStroke(stroke).build()
        
        dispatchGesture(gesture, null, null)
    }
}
