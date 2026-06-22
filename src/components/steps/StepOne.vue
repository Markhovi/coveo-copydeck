<template>
  <section class="step active">
    <div class="page-header">
      <h1>Configuration de l'événement</h1>
      <img
        class="brush-accent brush-title-img"
        src="/assets/brush-title-red.svg"
        alt=""
        aria-hidden="true"
      />
      <p>
        Remplissez les champs ci-dessous. Les champs avec
        <span class="req-badge">requis</span> sont obligatoires.
      </p>
    </div>
    <EventForm />
  </section>
</template>

<script setup>
import EventForm from '../form/EventForm.vue'
</script>
