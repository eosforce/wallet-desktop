<template>
  <div class="full-page">
    <div class="hero">
      <div class="container">
        <div class="entry">
          <div class="box entry__box">
            <div class="entry__box__headline">开启你的 EOS 原力钱包</div>
            <div class="entry__box__description">快速高效、具备投票及领取收益功能</div>
            <div class="entry__box__button">
              <router-link :to="{name: 'walletNew'}" class="button is-large">创建 EOS 原力钱包</router-link>
              <router-link :to="{name: 'walletImport'}" class="button is-large">导入 EOS 原力钱包</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Entry',
};
</script>

<style scoped>
.hero {
  flex: 1;
  justify-content: center;
}

.entry {
  display: flex;
  justify-content: center;
}

.entry__box {
  margin: 3rem 1rem;
  padding: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.entry__box__headline {
  font-size: 36px;
  font-weight: 400;
  line-height: 42px;
}

.entry__box__description {
  margin-top: 16px;
}

.entry__box__button {
  display: flex;
  flex-direction: column;
  margin: 40px;
}

.entry__box__button .button {
  margin-top: 24px;
  width: 460px;
}
</style>

