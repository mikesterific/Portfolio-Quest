<template>
  <div class="museum-view">
    <!-- Always show museum, but pass modal state -->
    <SpaceMuseum
      ref="spaceMuseumRef"
      :modal-open="!!selectedProject || isClosing"
      @project-selected="handleProjectSelected"
      @exit-museum="handleExitMuseum"
    />

    <!-- Show project modal when a project is selected -->
    <ProjectModal v-if="selectedProject" :project="selectedProject" @close="handleCloseProject" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from "vue";
import type { ComponentPublicInstance } from "vue";
import { useRouter } from "vue-router";
import SpaceMuseum from "@/components/portfolio/SpaceMuseum.vue";
import ProjectModal from "@/components/portfolio/ProjectModal.vue";
import type { ProjectData } from "@/types/game";

export default defineComponent({
  name: "MuseumView",
  components: {
    SpaceMuseum,
    ProjectModal,
  },
  setup() {
    const router = useRouter();
    const selectedProject = ref<ProjectData | null>(null);
    const isClosing = ref(false);
    const spaceMuseumRef = ref<
      (ComponentPublicInstance & { resumeMuseumPointerLock?: () => void }) | null
    >(null);

    const handleProjectSelected = (_event: { projectId: string }) => {
      // Project modals disabled — keep handler wired for easy re-enable.
      return;
    };

    const handleCloseProject = () => {
      console.log("Closing project modal");
      isClosing.value = true;
      selectedProject.value = null;

      // Same user gesture as close: restore keyboard focus + pointer lock without an extra click.
      spaceMuseumRef.value?.resumeMuseumPointerLock?.();

      // Reset the closing flag after a short delay
      setTimeout(() => {
        isClosing.value = false;
      }, 300);
    };

    const handleExitMuseum = () => {
      // Navigate back to home or wherever you want
      router.push("/");
    };

    // Handle ESC key to close modal
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Escape" && selectedProject.value) {
        handleCloseProject();
      }
    };

    onMounted(() => {
      document.addEventListener("keydown", handleKeyDown);
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handleKeyDown);
    });

    return {
      selectedProject,
      isClosing,
      spaceMuseumRef,
      handleProjectSelected,
      handleCloseProject,
      handleExitMuseum,
    };
  },
});
</script>

<style scoped>
.museum-view {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* Ensure modal appears above Three.js canvas */
.museum-view :deep(.modal-overlay) {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999 !important;
  pointer-events: all !important;
  background:
    radial-gradient(circle at 50% 0%, rgba(96, 165, 250, 0.18), transparent 36rem),
    rgba(3, 7, 18, 0.82) !important;
}

.museum-view :deep(.modal-content) {
  pointer-events: all !important;
  z-index: 10000 !important;
}
</style>
