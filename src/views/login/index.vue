<template>
  <div class="login-container flx-center">
    <div class="login-box">
      <SwitchDark class="dark" />
      <div class="login-form">
        <div class="login-logo">
          <img class="login-icon" src="@/assets/images/logo-L.png" alt="" />
          <!-- <h2 class="logo-text">重庆华裕胜久</h2> -->
        </div>
        <LoginForm />
      </div>
      <div class="login-left">
        <img class="login-left-img" src="@/assets/images/login_left.png" alt="login" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="login">
import LoginForm from "./components/LoginForm.vue";
import SwitchDark from "@/components/SwitchDark/index.vue";
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
