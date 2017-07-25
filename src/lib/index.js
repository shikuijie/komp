import 'style/index.less'

import Vue from 'vue'
import Bus from 'lib/bus'
import Checkbox from 'komp/checkbox.vue'
import Scroll from 'komp/scroll.vue'
import Datepicker from 'komp/datepicker.vue'
import Input from 'komp/input.vue'
import FormControl from 'komp/form/control.vue'
import FormAction from 'komp/form/action.vue'
import Form from 'komp/form/form.vue'
import TipAnchor from 'komp/tip/anchor.vue'
import TipShip from 'komp/tip/ship.vue'
import Table from 'komp/table/table.vue'
import ColfixTable from 'komp/table/colfix.vue'
import Tcell from 'komp/table/tcell.vue'
import ModalShip from 'komp/modal/ship.vue'
import ModalAnchor from 'komp/modal/anchor.vue'
import Notice from 'komp/notice.vue'
import Suggest from 'komp/select/suggest.vue'
import Select from 'komp/select/select.vue'
import Option from 'komp/select/option.vue'
import Optgrp from 'komp/select/optgrp.vue'

Vue.component('km-select', Select)
Vue.component('km-suggest', Suggest)
Vue.component('km-option', Option)
Vue.component('km-optgrp', Optgrp)
Vue.component('km-checkbox', Checkbox)
Vue.component('km-scroll', Scroll)
Vue.component('km-datepicker', Datepicker)
Vue.component('km-input', Input)
Vue.component('km-form-control', FormControl)
Vue.component('km-form-action', FormAction)
Vue.component('km-form', Form)
Vue.component('km-tip-anchor', TipAnchor)
Vue.component('km-tip-ship', TipShip)
Vue.component('km-table', Table)
Vue.component('km-colfix-table', ColfixTable)
Vue.component('km-tcell', Tcell)
Vue.component('km-modal-anchor', ModalAnchor)
Vue.component('km-modal-ship', ModalShip)
Vue.component('km-notice', Notice)

export {Bus}
