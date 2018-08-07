<template>
	<div>
		sdada
		<p>{{ msg }}</p>
		<a href="demo.html">跳转到demo页面</a>
		<br>
		<router-view />
		<router-link to="/home_demo">利用vue-router在改页面中跳转</router-link>
		<br>
		<router-link to="/">返回改页面</router-link>
		<hello-world></hello-world>

		<el-button type="success">主要按钮</el-button>
	</div>
</template>

<script type="text/babel">
	import HelloWorld from '@/components/HelloWorld.vue'

	export default {
		components: {
			HelloWorld
		},
		data () {
			return {
				msg: 'ewew'
			}
		}
	}
</script>

<style type="text/css">
	
</style>