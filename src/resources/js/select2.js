/* eslint-disable no-use-before-define */
const { getPossibleTranslation } = require('./utils')
const createGroupedField = options => {
  const fieldHtml = generateFieldHtml(options, 'select2-grouped');
  options.container.innerHTML += fieldHtml;
};

const createAjaxField = options => {
  const fieldHtml = generateFieldHtml(options, 'select2-ajax');
  options.container.innerHTML = fieldHtml;
}

const generateFieldHtml = (options, fieldType) => {
  const html = `
    <label>${options.label}</label>
    <select
      ${options.id !== undefined ? `id="${options.id}"` : ''}
      name="${options.name}"
      style="${options.style || 'width:100%'}"
      class="${options.class || 'form-control'} ${fieldType}"
      data-url="${options.url}"
    >
    </select>`;

  return html;
};

const initAjaxField = id => {
  const field = document.querySelector(`#${id}`);
  const { url } = field.dataset;
  $.ajaxSetup({
    headers: {
      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });
  $(field).select2({
    theme: 'bootstrap',
    multiple: false,
    ajax: {
      url,
      type: 'POST',
      dataType: 'json',
      data: params => {
        const query = {
          search: params.term,
          page: params.page || 1,
        };
        return query;
      },
      processResults({ data, current_page, last_page }) {
        const results = [];
        Object.values(data).forEach(tag => {
          results.push({
            id: tag.id,
            text: getPossibleTranslation(JSON.stringify(tag.name)),
          })
        })

        more = current_page < last_page;
        return {
          results,
          pagination: {more},
        }
      },
    },
  })
}

const initGroupedFields = (container = document) => {
  container.querySelectorAll('.select2-grouped').forEach(selectElement => {
    const { url } = selectElement.dataset;
    const finished = [];
    $.ajaxSetup({
      headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
      }
    });
    $(selectElement).select2({
      theme: 'bootstrap',
      multiple: false,
      ajax: {
        url,
        type: 'POST',
        dataType: 'json',
        data: params => {
          const query = {
            search: params.term,
            page: params.page || 1,
          };

          return query;
        },
        processResults({ data }) {
          const parentsNumber = Object.keys(data).length;
          const results = [];
          let more;

          if (parentsNumber > 1) {
            Object.entries(data).forEach(([namespace, response]) => {
              if (response.current_page === response.last_page) {
                finished.push(namespace);
              }
              if (response.data.length) {
                results.push({
                  text: namespace.split('\\').pop(),
                  children: Object.values(response.data).map(entry => ({
                    id: entry.id,
                    text: getPossibleTranslation(JSON.stringify(entry.name)),
                    namespace,
                  })),
                });
              }
            });
            more = finished.length < parentsNumber;
          } else {
            Object.entries(data).forEach(([namespace, response]) => {
              Object.values(response.data).forEach(entry => {
                results.push({
                  id: entry.id,
                  text: getPossibleTranslation(JSON.stringify(entry.name)),
                  namespace,
                });
              });
              more = response.current_page < response.last_page;
            });
          }

          console.log({results});
          return {
            results,
            pagination: { more },
          };
        },
      },
    }).on('select2:select', e => {
      const { data } = e.params;
      $(e.currentTarget).children()[0].dataset.namespace = data.namespace;
    });
  });
};

module.exports = {
  createGroupedField,
  initGroupedFields,
  createAjaxField,
  initAjaxField,
};
