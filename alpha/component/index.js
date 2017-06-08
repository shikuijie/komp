import Vue from 'vue'

import Form from './form/form.vue'
import FormControl from './form/control.vue'
import FormAction from './form/action.vue'
import Select from './select/select.vue'
import Optgroup from './select/optgroup.vue'
import Option from './select/option.vue'
import Mselect from './select/mselect.vue'
import Table from './table/table.vue'
import Tcell from './table/tcell.vue'
import Address from './address.vue'
import Checkbox from './checkbox.vue'
import Datepicker from './datepicker.vue'
import Dropdown from './dropdown.vue'
import Input from './input.vue'
import Automatch from './automatch.vue'
import Modal from './modal.vue'
import Pager from './pager.vue'
import Radio from './radio.vue'
import Scroll from './scroll.vue'
import Switch from './switch.vue'
import Textarea from './textarea.vue'
import Tooltip from './tooltip.vue'
import Triangle from './triangle.vue'
import Notify from './notify.vue'
import Monthpicker from './monthpicker.vue'
import Textlist from './textlist.vue'
import Position from './position.vue'

// 注册组件
Vue.component('afForm', Form)
Vue.component('afFormControl', FormControl)
Vue.component('afFormAction', FormAction)
Vue.component('afSelect', Select)
Vue.component('afMselect', Mselect)
Vue.component('afOptgroup', Optgroup)
Vue.component('afOption', Option)
Vue.component('afTable', Table)
Vue.component('afTcell', Tcell)
Vue.component('afAddress', Address)
Vue.component('afCheckbox', Checkbox)
Vue.component('afDatepicker', Datepicker)
Vue.component('afDropdown', Dropdown)
Vue.component('afInput', Input)
Vue.component('afAutomatch', Automatch)
Vue.component('afModal', Modal)
Vue.component('afPager', Pager)
Vue.component('afRadio', Radio)
Vue.component('afScroll', Scroll)
Vue.component('afSwitch', Switch)
Vue.component('afTextarea', Textarea)
Vue.component('afTooltip', Tooltip)
Vue.component('afTriangle', Triangle)
Vue.component('afNotify', Notify)
Vue.component('afMonthpicker', Monthpicker)
Vue.component('afTextlist', Textlist)
Vue.component('afPosition', Position)

// 注册指令
Vue.directive('tooltip', Tooltip.Directive)
Vue.directive('modal', Modal.Directive)
