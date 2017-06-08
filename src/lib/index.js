import './styles/index.less'

import Vue from 'vue'
import Bus from './bus'
import Select from './components/select/select.vue'
import SelectOption from './components/select/option.vue'
import SelectOptgroup from './components/select/optgroup.vue'
import Checkbox from './components/checkbox.vue'
import Scroll from './components/scroll.vue'

Vue.component('km-select', Select)
Vue.component('km-option', SelectOption)
Vue.component('km-optgroup', SelectOptgroup)
Vue.component('km-checkbox', Checkbox)
Vue.component('km-scroll', Scroll)

export {Bus}
