<template>
  <div id="PDAPage">
    <el-dialog title="登录"
      :visible.sync="dialogVisible"
      :fullscreen="true"
      :show-close="false"
      :close-on-press-escape="false">
      <el-form :model="form" label-position="top" >
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="请输入账号" auto-complete="off"/>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" placeholder="请输入密码" auto-complete="off" type="password"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="login">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import apis from '@/apis'

export default {
  name: 'PDAPage',
  data () {
    return {
      dialogVisible: true,
      form: {
        username: '',
        password: ''
      },
      empCode: ''
    }
  },
  methods: {
    _showDetail () {
      this.empCode = this.form.username
      this.dialogVisible = false
    },
    login () {
      apis.login({...this.form}).then(success => {
        if (success) {
          this._showDetail()
        } else {
          this.$message.error({ message: '登录失败!', center: true, duration: 3000 })
        }
      })
    }
  }
}
</script>

<style lang="css" scoped>
</style>
