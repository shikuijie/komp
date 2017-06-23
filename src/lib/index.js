import './styles/index.less'

import Vue from 'vue'
import Bus from './bus'
import Select from './components/select/select.vue'
import SelectOption from './components/select/option.vue'
import SelectOptgroup from './components/select/optgroup.vue'
import Checkbox from './components/checkbox.vue'
import Scroll from './components/scroll.vue'
import Datepicker from './components/datepicker.vue'
import Input from './components/input.vue'
import FormControl from './components/form/control.vue'
import FormAction from './components/form/action.vue'
import Form from './components/form/form.vue'
import TipHead from './components/tip/head.vue'
import TipBody from './components/tip/body.vue'
import Table from './components/table/table.vue'
import Tcell from './components/table/tcell.vue'
import ModalShip from './components/modal/ship.vue'
import ModalAnchor from './components/modal/anchor.vue'

Vue.component('km-select', Select)
Vue.component('km-option', SelectOption)
Vue.component('km-optgroup', SelectOptgroup)
Vue.component('km-checkbox', Checkbox)
Vue.component('km-scroll', Scroll)
Vue.component('km-datepicker', Datepicker)
Vue.component('km-input', Input)
Vue.component('km-form-control', FormControl)
Vue.component('km-form-action', FormAction)
Vue.component('km-form', Form)
Vue.component('km-tip-head', TipHead)
Vue.component('km-tip-body', TipBody)
Vue.component('km-table', Table)
Vue.component('km-tcell', Tcell)
Vue.component('km-modal-anchor', ModalAnchor)
Vue.component('km-modal-ship', ModalShip)

export {Bus}
