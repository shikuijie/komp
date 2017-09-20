<style>
</style>

<template>
  <div id="app">
    <km-form class="km-inline" :bus="person.bus" @submit="onSubmitPersonInfo" @invalid="onPersonInvalid">
      <km-form-control style="width:300px" name="edu">
        <km-select :option="person.info" :multiple="false" placeholder="占位字符串" v-model="person.info.edu"></km-select>
      </km-form-control>
      <km-form-control style="width:200px" name="age" :min="10" :max="20" :required="true" :number="true" @check="onCheckPersonAge">
        <km-input v-model="person.info.age"></km-input>
      </km-form-control>
      <km-form-control style="width:200px" name="birthday" @check="onCheckPersonBirthday">
        <km-datepicker :hastime="true" v-model="person.info.birthday"></km-datepicker>
      </km-form-control>
      <km-form-action>
        <button class="km-btn" type="submit">提交</button>
      </km-form-action>
    </km-form>

    <km-tip-anchor tag="button" class="km-btn" :bus="tip.bus" position="bottom" :edata="tip.edata">TIP</km-tip-anchor>
    <km-tip-anchor class="km-btn" :bus="tip.bus" position="right" :edata="tip.edata">TIP</km-tip-anchor>
    <km-tip-ship :bus="tip.bus" @show="onShowTip" style="width: 320px;">
      <template scope="{eid, edata}">
        <div>{{eid.name}}</div>
        <div>{{edata.name}}</div>
      </template>
    </km-tip-ship>

    <km-colfix-table :table="table" fixed="both" class="km-bordered" :rowspan="true">
      <km-tcell head="年龄" body="person.age" :foot="ave"></km-tcell>
      <km-tcell head="姓名">
        <km-tcell head="姓" body="person.fname" :foot="join"></km-tcell>
        <km-tcell head="名" body="person.lname" :foot="join"></km-tcell>
      </km-tcell>
      <km-tcell head="联系方式" body="person.contact[]" foot="联系方式"></km-tcell>
      <km-tcell head="职业" body="person.job" foot="职业"></km-tcell>
      <km-tcell head="期望">
        <km-tcell head="期望工作" body="person.expectJob" foot="期望工作"></km-tcell>
        <km-tcell head="期望月薪" body="person.expectSalary" foot="期望月薪"></km-tcell>
        <km-tcell head="期望城市" body="person.expectCity" foot="期望城市"></km-tcell>
      </km-tcell>
      <km-tcell head="地址" body="person.address" foot="地址"></km-tcell>
    </km-colfix-table>

    <km-modal-anchor :bus="modal.bus" :edata="{name: 'Shimoo'}">弹窗</km-modal-anchor>
    <km-modal-anchor :bus="modal.bus" :edata="{name: 'Shikuijie'}">弹窗2</km-modal-anchor>
    <km-modal-ship :bus="modal.bus" @show="onShowModal">
      <template scope="{edata}">
        <div style="width: 480px; height: 640px">
          <button class="km-btn" @click.stop="modal.bus.$emit('modal.toggle', edata)">{{edata.name}}</button>
        </div>
      </template>
    </km-modal-ship>

    <km-notice :bus="notice.bus"></km-notice>
    <button class="km-btn" @click.stop="notify">通知</button>

    <km-select v-model="cascade.value" style="width: 300px"
      @fetch="onAsyncFetch" @change="onChangeSelect"
      :option="cascade.option" :cascaded="false" :editable="false" :multiple="true">
    </km-select>
  </div>
</template>

<script>
import Vue from 'vue'
import {Bus} from 'lib'

export default {
  data () {
    return {
      person: {
        bus: new Bus(),
        edu: null,
        info: {
          edu: [],
          age: null,
          birthday: null,
          children: [{
            label: 'group1',
            children: [{
              label: 'label1',
              value: {name: 'value1'}
            }, {
              label: 'label2',
              value: {name: 'value2'}
            }]
          }, {
            label: 'group2',
            children: [{
              label: 'label3',
              value: {name: 'value3'}
            }, {
              label: 'label4',
              value: {name: 'value4'}
            }]
          }]
        }
      },
      tip: {
        bus: new Bus(),
        eid1: {name: 'shimoo'},
        eid: {name: 'SHIMOO'},
        edata: {name: 'SHIKUIJIE'}
      },
      table: {
        showAge: true,
        tbody: [{
          person: {
            fname: '诗',
            lname: '水',
            age: 32,
            job: 'Web Programmer',
            contact: ['15641877656', 'shikuijie@gmail.com'],
            address: '北京海淀区中关村',
            expectJob: '前端开发',
            expectSalary: '25k',
            expectCity: '北京'
          }
        }, {
          person: {
            fname: '石',
            lname: '木',
            age: 33,
            job: 'Internet Job',
            contact: ['skj9798@163.com', '17710547517'],
            address: '北京朝阳区呼家楼',
            expectJob: '前端开发',
            expectSalary: '25k',
            expectCity: '北京'
          }
        }],
        tfoot: {}
      },
      modal: {
        bus: new Bus()
      },
      notice: {
        bus: new Bus()
      },
      cascade: {
        value: [],
        option: {
          children: []
        }
      }
    }
  },
  methods: {
    ave (colItems, tfoot) {
      return colItems.reduce((res, i) => {
        return res + i
      })/colItems.length
    },
    join (colItems, tfoot) {
      return colItems.join('/')
    },
    onChangeSelect (val) {
      console.log(val)
    },
    onChangeSuggest (val) {
      console.log(val)
    },
    onCheckPersonAge ({value, resolve}) {
      window.setTimeout(() => {
        console.log('check age')
        resolve()
      }, 1000)
    },
    onCheckPersonBirthday ({value, resolve}) {
      window.setTimeout(() => {
        console.log('check birthday')
        resolve('birthday fail')
      }, 500)
    },
    onSubmitPersonInfo ({resolve, errors}) {
      if (errors.length) {
        resolve()
        return console.log(errors)
      }
      console.log('start submit person info')
      window.setTimeout(() => {
        console.log('submit person info stop')
        resolve()
      }, 2000)
    },
    onPersonInvalid (errs) {
      console.log(errs)
      alert('表单验证错误，请查看')
    },
    onShowTip ({resolve, eid}) {
      window.setTimeout(() => {
        resolve(eid)
      }, 2000)
    },
    onShowModal ({resolve}) {
      console.log('show modal')
      window.setTimeout(() => {
        resolve(true)
      }, 500)
    },

    notify () {
      var success = Math.floor(Math.random() * 10) % 2
      this.notice.bus.$emit( success ? 'notice.success' : 'notice.fail', success ? '成功了，真厉害' : '失败了，好挫啊')
    },
    onWriteSuggest ({resolve, text}) {
      window.setTimeout(() => {
        this.suggest.items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() => {
          var t = text + [1, 2, 3, 4, 5].map(() => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]).join('')
          return {
            label: t,
            value: t
          }
        })
        resolve()
      })
    },

    onAsyncFetch ({option, text, resolve}) {
      window.setTimeout(() => {
        if (!option.value) {
          option.children = [{
            label: '级联1', value: 'cascade1', children: []
          }, {
            label: '级联2', value: 'cascade2'
          }, {
            label: '级联3', value: 'cascade3'
          }, {
            label: '级联4', value: 'cascade4'
          }, {
            label: '级联5', value: 'cascade5'
          }]
        }

        if (option.value === 'cascade1') {
          option.children = [{
            label: '级联1-1', value: 'cascade1-1'
          }, {
            label: '级联1-2', value: 'cascade1-2', children: []
          }, {
            label: '级联1-3', value: 'cascade1-3'
          }, {
            label: '级联1-4', value: 'cascade1-4'
          }, {
            label: '级联1-5', value: 'cascade1-5'
          }, {
            label: '级联1-6', value: 'cascade1-6'
          }]
        }

        if (option.value === 'cascade1-2') {
          option.children = [{
            label: '级联1-2-1', value: 'cascade1-2-1', children: []
          }, {
            label: '级联1-2-2', value: 'cascade1-2-2'
          }, {
            label: '级联1-2-3', value: 'cascade1-2-3'
          }]
        }

        if (option.value === 'cascade1-2-1') {
          option.children = [{
            label: '级联1-2-1-1', value: 'cascade1-2-1-1'
          }, {
            label: '级联1-2-1-2', value: 'cascade1-2-1-2'
          }, {
            label: '级联1-2-1-3', value: 'cascade1-2-1-3'
          }]
        }
        resolve()
      }, 200)
    }
  }
}
</script>

<style lang="less">
.km-select {
  .km-option-list {
    width: 120px;
    .km-scroll {
      max-height: 140px;
    }
  }
}

.km-table {
  .km-tcell {
    width: 10em;
    padding-left: 1em;
  }

  thead, tfoot {
    tr {
      height: 30px;
    }
  }
  tbody {
    tr {
      height: 40px;
    }
  }
}
</style>
