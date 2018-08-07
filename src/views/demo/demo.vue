<template>
	<section>
		<div>{{ msg }}</div>
		<a href="home.html">返回home</a>

		<Steps :current="1">
	        <Step title="已完成" content="这里是该步骤的描述信息"></Step>
	        <Step title="进行中" content="这里是该步骤的描述信息"></Step>
	        <Step title="待进行" content="这里是该步骤的描述信息"></Step>
	        <Step title="待进行" content="这里是该步骤的描述信息"></Step>
	    </Steps>
	</section>
</template>

<script type="text/babel">
	export default {
		data () {
			return {
				msg: 'demo'
			}
		}
	}
</script>

<style type="text/css">
	
</style>