import Vue from 'vue'
import Home from './home.vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import $ from '@/common/index.js'
const HomeDemo = resolve => require(['./home_demo.vue'], resolve)

Vue.use(ElementUI)

const routes = [
	{
		path: '/home_demo',
		component: HomeDemo
	}
]

Vue.use(VueRouter)

const router = new VueRouter({
	routes: routes
})

const home_vm = new Vue({
	// template: '<home/>'  这里不能使用template，因为vue的运行时版本，没有模板转渲染函数
	router: router,
	render: h => h(Home)
}).$mount('#app')