import Vue from 'vue'
import Demo from './demo.vue'
import Iview from 'iview'
import 'iview/dist/styles/iview.css'
import $ from '@/common/index.js'


Vue.use(Iview)

const demo_vm = new Vue({
	render: h => h(Demo)
}).$mount('#app')