package com.remotelink.app.data.remote

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {
    @POST("/api/auth/register")
    suspend fun register(@Body request: Map<String, String>): Response<Any>

    @POST("/api/auth/login")
    suspend fun login(@Body request: Map<String, String>): Response<Any>

    @POST("/api/devices/register")
    suspend fun registerDevice(@Body request: Map<String, String>): Response<Any>

    @POST("/api/pairing/create")
    suspend fun createPairingSession(@Body request: Map<String, String>): Response<Any>

    @POST("/api/pairing/join")
    suspend fun joinPairingSession(@Body request: Map<String, String>): Response<Any>

    @POST("/api/pairing/approve")
    suspend fun approvePairingSession(@Body request: Map<String, String>): Response<Any>

    @POST("/api/pairing/reject")
    suspend fun rejectPairingSession(@Body request: Map<String, String>): Response<Any>

    @POST("/api/sessions/create")
    suspend fun createRemoteSession(@Body request: Map<String, String>): Response<Any>

    @POST("/api/sessions/{id}/end")
    suspend fun endRemoteSession(@Path("id") id: String, @Body request: Map<String, String>): Response<Any>

    @GET("/api/trusted-devices")
    suspend fun getTrustedDevices(@Query("deviceId") deviceId: String): Response<Any>

    @DELETE("/api/trusted-devices/{id}")
    suspend fun revokeTrustedDevice(@Path("id") id: String, @Body request: Map<String, String>): Response<Any>
}
