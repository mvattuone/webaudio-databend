import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import fontawesome from '@fortawesome/fontawesome'
import * as faBars from '@fortawesome/fontawesome-free-solid/faBars'

fontawesome.library.add(faBars)

import 'element-ui/lib/theme-chalk/reset.css'
import './scss/reset.scss'
import './scss/theme.scss'

Vue.use(ElementUI, { locale })

new Vue({
  el: '#app',
  render: h => h(App),
})
