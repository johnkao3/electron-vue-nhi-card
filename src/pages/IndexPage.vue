<template>
  <q-page class="flex flex-center">
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    />
  </q-page>
</template>

<script>
import { defineComponent, onMounted } from "vue";
import { useQuasar } from "quasar";

// Source Code: https://gist.github.com/mis101247/d5f3fb131d1bc0092558b8daa4048430#file-deidentification-js
function deIdentification(str) {
  const showLen = Math.round(str.length / 2); // 顯示幾個
  const markLen = str.length - showLen; // 要隱藏幾個
  const showStart = Math.round((str.length - showLen) / 2); // 從哪開始隱
  return str.replace(str.substr(showStart, markLen), "*".repeat(markLen));
}

export default defineComponent({
  name: "IndexPage",
  setup() {
    const $q = useQuasar();
    onMounted(() => {
      window.myAPI.insertCard((_event, value) => {
        if (value === true) {
          console.log("Loading......");
          $q.loading.show();
        }
      });
      window.myAPI.getCard((_event, value) => {
        console.log(value);
        $q.loading.hide();
        $q.notify({
          position: "center",
          timeout: 5000,
          message: `報到成功 ${deIdentification(value)}，請抽離健保卡`,
        });
      });
    });
  },
});
</script>
