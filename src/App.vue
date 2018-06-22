<template>
  <div id="app">
    <img src="./assets/logo.png">
    <HelloWorld/>
    <PDAPage/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld'
import PDAPage from './components/PDAPage'

export default {
  name: 'App',
  components: {
    HelloWorld
    PDAPage
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
