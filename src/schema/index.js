/**
 * schema/index.js — single source of truth for all event fields.
 *
 * Every field defined here automatically appears in:
 *   - The rendered form (EventForm.vue)
 *   - The .docx copydeck (docx-builder.js)
 *   - The Sitecore CSV export (csv-builder.js)
 */

export const SCHEMA = {

  /* ── Field definitions ──────────────────────────────────────────────
   *
   * Each field key matches the name used in form state.
   *
   * Field properties:
   *   label        {string}   Form label (French UI)
   *   docxLabel    {string}   Label in the .docx copydeck table
   *   type         {string}   'text'|'textarea'|'url'|'date'|'time'|
   *                           'select'|'radio'|'toggle'|'position'
   *   csvColumn    {string}   CSV column header; null = not a direct column
   *   required     {boolean}
   *   default      {*}        Pre-filled value
   *   placeholder  {string}
   *   maxLength    {number}
   *   charHint     {string}   Short hint shown beside label ("60 car. max")
   *   hint         {string}   Non-counter hint beside label
   *   rows         {number}   For textarea
   *   options      {Array}    [{value, label}] for select/radio
   *   docxOptions  {string}   Pipe-separated options shown in docx
   *   showWhen     {Object}   {field, value} — conditional visibility
   */
  fields: {

    // ── Identification ─────────────────────────────────────────────
    itemName: {
      label: "Nom de l'événement",
      docxLabel: "Nom de l'événement",
      type: 'text',
      csvColumn: 'ItemName',
      required: true,
      placeholder: 'ex: Event SS - In Person'
    },
    itemPath: {
      label: 'Chemin de publication',
      docxLabel: 'Chemin de publication',
      type: 'text',
      csvColumn: 'ItemPath',
      placeholder: '/sitecore/content/Home/Resources/Events/2026/'
    },

    // ── Meta Data (SEO) ────────────────────────────────────────────
    metaTitle: {
      label: 'Titre SEO',
      docxLabel: 'Titre SEO (Meta)',
      type: 'text',
      csvColumn: 'MetaTitle',
      maxLength: 60,
      charHint: '60 car. max',
      required: true
    },
    metaDescription: {
      label: 'Description SEO',
      docxLabel: 'Description SEO (Meta)',
      type: 'textarea',
      csvColumn: 'MetaDescription',
      rows: 2,
      maxLength: 160,
      charHint: '160 car. max',
      required: true
    },
    metaImage: {
      label: 'Image SEO',
      docxLabel: 'Image SEO (Meta)',
      type: 'text',
      csvColumn: 'MetaImage',
      hint: '1200×630 — png ou jpg',
      placeholder: "Chemin ou URL de l'image"
    },

    // ── Data ───────────────────────────────────────────────────────
    pretitle: {
      label: 'Surtitre',
      docxLabel: 'Surtitre',
      type: 'text',
      csvColumn: 'Pretitle'
    },
    title: {
      label: 'Titre principal',
      docxLabel: 'Titre principal',
      type: 'textarea',
      csvColumn: 'Title',
      rows: 2,
      required: true
    },
    subtitle: {
      label: 'Sous-titre',
      docxLabel: 'Sous-titre',
      type: 'text',
      csvColumn: 'Subtitle'
    },
    thumbnailImage: {
      label: 'Image miniature',
      docxLabel: 'Image miniature (Thumbnail)',
      type: 'text',
      csvColumn: 'ThumbnailImage',
      hint: 'Resource Search',
      placeholder: 'Chemin Sitecore ou URL'
    },
    heroImage: {
      label: 'Image principale (Hero)',
      docxLabel: 'Image principale (Hero)',
      type: 'text',
      csvColumn: 'HeroImage',
      placeholder: 'Chemin Sitecore ou URL'
    },

    // ── Event Time and Date ─────────────────────────────────────────
    startDate: {
      label: 'Date de début',
      docxLabel: 'Date de début',
      type: 'date',
      csvColumn: 'EventStartDate',
      required: true
    },
    startTime: {
      label: 'Heure de début',
      docxLabel: 'Heure de début',
      type: 'time',
      csvColumn: 'EventStartTime',
      required: true
    },
    endDate: {
      label: 'Date de fin',
      docxLabel: 'Date de fin',
      type: 'date',
      csvColumn: 'EventEndDate',
      required: true
    },
    endTime: {
      label: 'Heure de fin',
      docxLabel: 'Heure de fin',
      type: 'time',
      csvColumn: 'EventEndTime',
      required: true
    },
    timeZone: {
      label: 'Fuseau horaire',
      docxLabel: 'Fuseau horaire',
      type: 'select',
      csvColumn: 'EventTimeZone',
      options: [
        { value: 'Eastern Standard Time', label: 'Eastern Standard Time (ET)' },
        { value: 'Central Standard Time', label: 'Central Standard Time (CT)' },
        { value: 'Pacific Standard Time', label: 'Pacific Standard Time (PT)' },
        { value: 'GMT Standard Time',     label: 'GMT Standard Time (GMT)' },
        { value: 'Central European Standard Time', label: 'Central European Standard Time (CET)' }
      ],
      docxOptions: 'Eastern ST | Central ST | Pacific ST | GMT | CET',
      required: true
    },
    displayWeekday: {
      label: 'Afficher le jour de la semaine',
      docxLabel: 'Afficher le jour de la semaine',
      type: 'toggle',
      csvColumn: 'DisplayWeekday',
      default: false,
      docxOptions: 'true | false'
    },
    displayEventTimeZone: {
      label: 'Afficher le fuseau horaire',
      docxLabel: 'Afficher le fuseau horaire',
      type: 'toggle',
      csvColumn: 'DisplayEventTimeZone',
      default: true,
      docxOptions: 'true | false'
    },
    displayGenericTimeZoneAbbreviation: {
      label: "Afficher l'abréviation du fuseau",
      docxLabel: "Afficher l'abréviation du fuseau",
      type: 'toggle',
      csvColumn: 'DisplayGenericTimeZoneAbbreviation',
      default: true,
      docxOptions: 'true | false'
    },
    displayEventDuration: {
      label: "Afficher la durée de l'événement",
      docxLabel: "Afficher la durée de l'événement",
      type: 'toggle',
      csvColumn: 'DisplayEventDuration',
      default: false,
      docxOptions: 'true | false'
    },

    // ── Event Location ──────────────────────────────────────────────
    location: {
      label: 'Adresse / Lieu',
      docxLabel: 'Adresse / Lieu',
      type: 'text',
      csvColumn: 'EventLocation'
    },
    directionLink: {
      label: "Lien d'itinéraire",
      docxLabel: "Lien d'itinéraire (Maps)",
      type: 'url',
      csvColumn: 'DirectionLink',
      hint: 'Google Maps / Waze',
      placeholder: 'https://'
    },

    // ── Event Registration ──────────────────────────────────────────
    registrationBehavior: {
      label: "Type d'inscription",
      docxLabel: "Type d'inscription",
      type: 'radio',
      csvColumn: 'RegistrationBehavior',
      options: [
        { value: 'Page with form',        label: 'Page with form' },
        { value: 'External Registration', label: 'External Registration' }
      ],
      default: 'Page with form',
      docxOptions: 'Page with form | External Registration'
    },
    externalRegistrationLink: {
      label: "Lien d'inscription externe",
      docxLabel: "Lien d'inscription externe",
      type: 'url',
      csvColumn: 'ExternalRegistrationLink',
      placeholder: 'https://',
      showWhen: { field: 'registrationBehavior', value: 'External Registration' }
    },
    registrationLabel: {
      label: 'Texte du bouton (CTA)',
      docxLabel: "Texte du bouton d'inscription",
      type: 'text',
      csvColumn: 'RegistrationLabel',
      default: 'Register Now'
    },
    overrideFormTitle: {
      label: 'Titre du formulaire',
      docxLabel: 'Titre personnalisé du formulaire',
      type: 'text',
      csvColumn: 'OverrideFormTitle',
      default: 'Register to attend'
    },
    eventInProgressMessage: {
      label: "Message « événement en cours »",
      docxLabel: "Message de l'événement en cours",
      type: 'textarea',
      csvColumn: 'EventInProgressMessage',
      rows: 2,
      default: 'A recording will be available soon! In the meantime, check out these other resources.'
    }
  },

  /* ── Form sections ──────────────────────────────────────────────────
   *
   * Defines card layout: which fields appear in which grid rows.
   * rows[].cols: 1 | 2 | 3 | 'toggles'
   */
  sections: [
    {
      id: 'identification',
      icon: '⚙',
      label: 'Identification',
      rows: [
        { cols: 2, fields: ['itemName', 'itemPath'] }
      ]
    },
    {
      id: 'meta',
      icon: '🔍',
      label: 'Meta Data (SEO)',
      rows: [
        { cols: 1, fields: ['metaTitle'] },
        { cols: 1, fields: ['metaDescription'] },
        { cols: 1, fields: ['metaImage'] }
      ]
    },
    {
      id: 'data',
      icon: '📝',
      label: 'Data',
      rows: [
        { cols: 2, fields: ['pretitle', 'subtitle'] },
        { cols: 1, fields: ['title'] },
        { cols: 2, fields: ['thumbnailImage', 'heroImage'] }
      ]
    },
    {
      id: 'datetime',
      icon: '📅',
      label: 'Date et heure',
      rows: [
        { cols: 2, fields: ['startDate', 'endDate'] },
        { cols: 3, fields: ['startTime', 'endTime', 'timeZone'] },
        { cols: 'toggles', fields: ['displayWeekday', 'displayEventTimeZone', 'displayGenericTimeZoneAbbreviation', 'displayEventDuration'] }
      ]
    },
    {
      id: 'location',
      icon: '📍',
      label: 'Lieu',
      rows: [
        { cols: 2, fields: ['location', 'directionLink'] }
      ]
    },
    {
      id: 'registration',
      icon: '✍',
      label: 'Inscription',
      rows: [
        { cols: 2, fields: ['registrationBehavior', 'externalRegistrationLink'] },
        { cols: 2, fields: ['registrationLabel', 'overrideFormTitle'] },
        { cols: 1, fields: ['eventInProgressMessage'] }
      ]
    }
  ],

  /* ── Widget field schema (repeating unit) ───────────────────────────
   *
   * widgetRows defines the layout within each "Content Section N" card.
   * The 'position' type renders Left/Right radio buttons.
   */
  widgetRows: [
    {
      cols: 2,
      fields: [
        {
          localKey: 'titleText',
          path: 'titleSection.text',
          label: 'Titre de section',
          docxLabel: 'Titre de section',
          type: 'textarea',
          rows: 2,
          hint: 'Rich text',
          csvColumn: 'WidgetText',
          required: true
        },
        {
          localKey: 'titlePosition',
          path: 'titleSection.componentPosition',
          label: 'Position du titre',
          docxLabel: 'Position du titre',
          type: 'position',
          default: 'Left',
          csvColumn: 'ComponentPosition',
          docxOptions: 'Left | Right'
        }
      ]
    },
    {
      cols: 1,
      fields: [
        {
          localKey: 'descText',
          path: 'descriptionSection.text',
          label: 'Description / Texte',
          docxLabel: 'Description / Texte',
          type: 'textarea',
          rows: 3,
          hint: 'Rich text',
          csvColumn: 'WidgetText',
          required: true
        }
      ]
    },
    {
      cols: 1,
      fields: [
        {
          localKey: 'descPosition',
          path: 'descriptionSection.componentPosition',
          label: 'Position de la description',
          docxLabel: 'Position de la description',
          type: 'position',
          default: 'Right',
          csvColumn: 'ComponentPosition',
          docxOptions: 'Left | Right'
        }
      ]
    }
  ],

  /* ── CSV column order ───────────────────────────────────────────────
   *
   * This array defines the header row and column ordering.
   * Every row in the CSV must emit values in this exact order.
   * 'ID' and 'TemplateName' are structural; not in fields above.
   */
  csvColumns: [
    'ID', 'ItemName', 'ItemPath', 'TemplateName',
    'MetaTitle', 'MetaDescription', 'MetaImage',
    'Pretitle', 'Title', 'Subtitle', 'ThumbnailImage', 'HeroImage',
    'EventStartDate', 'EventStartTime', 'EventEndDate', 'EventEndTime',
    'EventTimeZone', 'DisplayWeekday', 'DisplayEventTimeZone',
    'DisplayGenericTimeZoneAbbreviation', 'DisplayEventDuration',
    'EventLocation', 'DirectionLink',
    'RegistrationBehavior', 'ExternalRegistrationLink',
    'RegistrationLabel', 'OverrideFormTitle',
    'EventInProgressMessage',
    'WidgetText', 'ComponentPosition'
  ],

  /* ── Sitecore template paths ────────────────────────────────────── */
  templates: {
    event:   '/sitecore/templates/Feature/Resources/Resource/Resource Event/Resource Event Self Serve',
    widgets: '/sitecore/templates/Project/Widgets/Widgets',
    layout:  '/sitecore/templates/Project/Widgets/Layout Container',
    text:    '/sitecore/templates/Project/Widgets/Text'
  },

  /* ── Docx section groupings ─────────────────────────────────────────
   *
   * Controls which fields appear under which header row in the .docx.
   * fieldKeys references SCHEMA.fields keys.
   */
  docxSections: [
    {
      header: 'Identification',
      fieldKeys: ['itemName', 'itemPath']
    },
    {
      header: 'Meta Data (SEO)',
      fieldKeys: ['metaTitle', 'metaDescription', 'metaImage']
    },
    {
      header: 'Data',
      fieldKeys: ['pretitle', 'title', 'subtitle', 'thumbnailImage', 'heroImage']
    },
    {
      header: 'Event Time and Date',
      fieldKeys: ['startDate', 'startTime', 'endDate', 'endTime', 'timeZone',
        'displayWeekday', 'displayEventTimeZone',
        'displayGenericTimeZoneAbbreviation', 'displayEventDuration']
    },
    {
      header: 'Event Location',
      fieldKeys: ['location', 'directionLink']
    },
    {
      header: 'Event Registration',
      fieldKeys: ['registrationBehavior', 'externalRegistrationLink',
        'registrationLabel', 'overrideFormTitle']
    },
    {
      header: 'Event State Messages',
      fieldKeys: ['eventInProgressMessage']
    }
  ]
}
