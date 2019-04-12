<template>
  <div>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6" v-for='(form, index) in formList' :key='index'>
        <el-card class="box-card">
          <div slot="header" class="card-header clearfix">
            <h3>{{form.month}}月份</h3>
            <el-button @click="remove(form)" v-if="index === formList.length-1" style="float: right; padding: 3px 0" type="text">X</el-button>
            <p>档位: {{form.level}}</p>
            <p>未扣个税合计金额: {{form.taxableIncome}}</p>
            <p>预扣缴个税额: {{form.taxAmount}}</p>
          </div>
          <el-form ref="form" :model="form" label-width="124px">
            <el-form-item label="月工资">
              <el-input v-model.number="form.salary"></el-input>
            </el-form-item>
            <el-form-item label="员工购">
              <el-input v-model.number="form.buy"></el-input>
            </el-form-item>
            <el-form-item label="项目奖">
              <el-input v-model.number="form.reward"></el-input>
            </el-form-item>
            <el-form-item label="社保扣款">
              <el-input v-model.number="form.socialSecurity"></el-input>
            </el-form-item>
            <el-form-item label="公积金扣款">
              <el-input v-model.number="form.accumulationFund"></el-input>
            </el-form-item>
            <el-form-item label="个税专项扣除">
              <el-input v-model.number="form.specialDeduction"></el-input>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col style="text-align: center;">
        <el-button @click="add">新增</el-button>
        <el-button type="success" @click="count">计算</el-button>
      </el-col>
    </el-row>


  </div>

</template>
<script type='text/javascript'>
  const STORE_KEY = "salary";
  const BASE = 5000;
  const RULE = [
    { level: 1, min: 0, rate: 0.03, num: 0 },

    { level: 2, min: 36000, rate: 0.1, num: 2520 },

    { level: 3, min: 144000, rate: 0.2, num: 16920 },

    { level: 4, min: 300000, rate: 0.25, num: 31920 },

    { level: 5, min: 420000, rate: 0.3, num: 52920 },

    { level: 6, min: 660000, rate: 0.35, num: 85920 },

    { level: 7, min: 960000, rate: 0.45, num: 181920 },
  ]
  export default {
    name: '',
    data() {
      return {
        form: {
          level: 1,
          salary: 10000,
          buy: 500,
          reward: 0,
          socialSecurity: 100,
          accumulationFund: 50,
          specialDeduction: 1500,
          taxableIncome: 0,
          taxAmount: 0,
        },
        formList: JSON.parse(window.localStorage.getItem(STORE_KEY)) || [],
      }
    },
    computed: {
      currentMonth() {
        const formListL = this.formList.length;
        return formListL ? this.formList[formListL - 1]['month'] + '月' : ''
      }
    },
    created() {
      !this.formList.length && this.add();
    },
    methods: {
      add() {
        const formList = this.formList;
        const listLen = formList.length;
        const item = { ...formList[listLen-1], month: listLen + 1, taxableIncome: 0, taxAmount: 0 }
        formList.push(item)
      },
      count() {

        let sumInput = 0; //累积收入
        let sumInputNotTax = 0; //累积免税收入
        let sumDeduction = 0; //累积减除费用
        let sumSpecialDeduction = 0; //累积专项扣除

        let taxableIncomeSum = 0; //应税所得额总和
        let taxAmountPaySum = 0; //已缴税总和

        this.formList.map((item, index) => {
          const { salary, buy, reward, socialSecurity, accumulationFund, specialDeduction } = item;
          const curSumInput = salary + buy + reward; //当前收入：工资+员工购+奖金
          let curTaxableIncome = curSumInput - socialSecurity - accumulationFund - specialDeduction - BASE; //当前应税所得额 收入-社保公积金-专项扣除-起征点
          curTaxableIncome = curTaxableIncome < 0 ? 0 : curTaxableIncome

          sumInput += curSumInput;
          sumInputNotTax += socialSecurity + accumulationFund; //社保+公积金
          sumDeduction += BASE; //5000的免征点
          sumSpecialDeduction += specialDeduction;

          taxableIncomeSum += curTaxableIncome; //应税所得额总和
          taxAmountPaySum += index > 0 ? this.formList[index - 1]['taxAmount'] : 0; //已缴税总和

          const matchRule = this.getMatchRule(taxableIncomeSum); //根据应税所得额总和找到适合对档位
          const curTaxAmount = taxableIncomeSum * matchRule.rate - matchRule.num - taxAmountPaySum;
          item.taxAmount = Number(curTaxAmount.toFixed(2));
          item.level = matchRule.level
          item.taxableIncome = Number((curTaxableIncome + BASE + specialDeduction).toFixed(2))
        })
        window.localStorage.setItem(STORE_KEY, JSON.stringify(this.formList))

      },
      getMatchRule(num) {//获取档位
        let matchIndex = RULE.findIndex(item => num <= item.min)
        matchIndex = matchIndex > 0 ? matchIndex - 1 : 0;
        return RULE[matchIndex];
      },
      remove({ month }) {
        const matchIndex = this.formList.findIndex(item => item.month === month)
        this.formList.splice(matchIndex, 1)
      },
      onSubmit() {
        this.count()
      }
    },
  }
</script>
<style lang='scss' scoped>
  .card-header {
    font-size: 12px;

    h3 {
      margin: 0;
      text-align: center;
    }

    p {
      margin: 0;
      line-height: 1.2em;
    }
  }
</style>
