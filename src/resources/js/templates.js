/* eslint-disable no-use-before-define */
const { truncate } = require('./utils');

const mediaItem = media => `
<div
  title="${media.media_content.title}" 
  class="ui-widget-content selectable col-md-2 col-sm-3 m-1" data-file="${media.id}"
>
  <img src="${media.media_content.preview}">
</div>
`;

const paginationLoader = () => `
<div class="pagination-loader col-sm-12 d-flex justify-content-center m-0">
  <h4><span class="la la-spinner la-spin mt-3"></span></h4>
</div>`;

const noMediasFound = () => '<p>No Medias Found<p>';

const tagItem = tag => `
<li class="list-group-item">
  <a href="#" title="${tag.name}" class="select-tag" data-tag="${tag.id}">
    ${truncate(tag.name, 10)}
  </a>
</li>
`;

const noTagsFound = () => '<li  class="list-group-item">No Tags</li>';

const tagsSelectOptions = tags => tags.map(tag => `
  <option value="${tag.id}">
    ${tag.name}
  </option>
`);

const tagsSelect = tags => {
  const options = tagsSelectOptions(tags);
  return `
  <select name="tags" class="tags-select form-control">
  ${options}
  </select>`;
};

const tagsLoader = () => '<span class="w-100 text-center tags-loader la la-spinner la-spin mt-3"></span>';

const uploadModalTitle = length => `
  Uploading <span class="medias-count">${length}</span> medias
`;

const uploadPreview = (file, i, types) => {
  const { media } = file;

  const ext =  media.name.split('.').pop();
  const ext3D = ['dae', 'abc', 'usd', 'usdc', 'usda', 'ply', 'stl', 'fbx', 'glb', 'gltf', 'obj', 'x3d'];
  const is3d = ext3D.includes(ext);
  const mediaPreviewTemplate = mediaPreview(media, i, is3d);
  const metadataFormTemplate = metadataForm(i, types, {media, is3d});

  let mediaSize = media.size;
  let unit = '';
  let j = 0;
  const units = ['KB', 'MB', 'GB'];

  while (mediaSize > 1024 && j < units.length) {
    mediaSize = Math.round(mediaSize / 1024);
    unit = units[j];
    j += 1;
  }

  return `
    <div class="card file-row" data-name="${media.name}">
      <div class="card-header" id="heading_${i}">
        <h5 class="mb-0" style="text-align:center">
          <button
            class="btn btn-link"
            data-toggle="collapse"
            data-target="#collapse_${i}"
            aria-expanded="true"
            aria-controls="collapse_${i}"
            title="${media.name}"
          >
          <b>${truncate(media.name, 25)}</b> ${mediaSize} ${unit}
          <span class="loader-container"></span>
          <p class="mt-2 mb-0 text-center"></p>
          </button>
          <a href="#" style="float:right" class="text-danger">
            <i
              style="vertical-align:middle"
              data-name="${media.name}"
              class="remove-media-btn las la-trash-alt">
            </i>
          </a>
        </h5>
      </div>
      <div
        id="collapse_${i}" 
        class="collapse ${i === 0 ? 'show' : ''}"
        aria-labelledby="heading_${i}"
        data-parent="#accordion">   
        <div class="card-body">
          ${mediaPreviewTemplate}
          ${metadataFormTemplate}
        </div>
      </div>
    </div>
  `;
};

const metadataForm = (i, types, {media, is3d}) => {
  let { name, type } = media;
  if (is3d) type = 'model';
  const typesListTemplate = typesList(types, type);
  const select = `
    <div id="select2-container-${i}" class="form-group">
      
    </div>
  `;

  return `
    <form id="metadata-form-${i}">
      ${select}
      <div class="form-group">
        <label>Title</label>
        <input name="title" type="text" class="form-control" value="${name.split('.').shift()}">
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea name="description" class="form-control"></textarea>
      </div>
      ${typesListTemplate}
    </form>`;
};

const typesList = (types, type) => {
  let list = '';
  let selectedType;

  if (/^image/.test(type)) {
    [selectedType] = types.filter(type => type.key === 'image');
  } else if (/^video/.test(type)) {
    [selectedType] = types.filter(type => type.key === 'video');
  } else if (/^audio/.test(type)) {
    [selectedType] = types.filter(type => type.key === 'audio' || type.key === 'music');
  } else if (/^model/.test(type)) {
    [selectedType] = types.filter(type => type.key === '3d_model_interact' || type.key === '3d_model_ar');
  }

  types.forEach(type => {
    list += `<option ${selectedType.id === type.id ? 'selected' : ''} value="${type.id}">${type.name}</option>`;
  });


  return `
  <div class="form-group">
    <label>Media Type</label>
    <select name="type" class="form-control">
      ${list}
    </select>
  </div>`;
};

const mediaPreview = (media, i, is3d) => {
  const { type } = media;
  const typesWithoutPreview = ['video/avi'];

  let template = '';

  if (is3d) {
    template = model3dTemplate();
  }
  else if (typesWithoutPreview.includes(type)) {
    template = noPreview(type);
  } else if (/^image/.test(type)) {
    template = imagePreview(media, i);
  } else if (/^video/.test(type)) {
    template = videoPreview(i);
  } else if (/^audio/.test(type)) {
    template = audioPreview(i);
  }

  return template;
};

const noPreview = type => `
  <small>No preview available for type ${type}</small>
`;

const model3dTemplate = () => '3D Model Preview';

const imagePreview = (media, i) => {
  const uncropableTypes = ['image/gif'];
  let cropTemplate = '';

  if (!uncropableTypes.includes(media.type)) {
    cropTemplate = `
    <button id="crop-btn-${i}" class="form-control btn btn-default btn-sm crop-btn" data-id="${i}">
      Crop
    </button>
    <div class="mt-1" id="crop_image_${i}">
      ${cropImageTemplate(media, i)}
    </div>
    `;
  }

  return `
    <img
      id="image-preview-${i}" 
      class="w-100 my-3"
      src="${URL.createObjectURL(media)}"
    >
    ${cropTemplate}
  `;
};

const cropImageTemplate = (media, i) => {
  const tmpImg = document.createElement('img');
  tmpImg.classList.add(`to_be_crop_${i}`);
  tmpImg.style.maxWidth = '100%';
  tmpImg.src = URL.createObjectURL(media);

  const buttonConfirm = document.createElement('button');
  buttonConfirm.textContent = 'Confirm';
  buttonConfirm.classList = 'confirm-crop btn btn-default btn-sm';
  buttonConfirm.id = `crop_btn_${i}`;
  buttonConfirm.dataset.id = i;

  return `
  <div class="d-none" id="imageCropper_${i}">
    ${buttonConfirm.outerHTML}
    ${tmpImg.outerHTML}
  </div>`;
};

const videoPreview = i => `
<video controls id="video-preview-video-${i}" class="w-100 my-3">
  <source id="video-preview-source-${i}" src="">
  Your browser does not support the video tag.
</video>`;

const audioPreview = i => `
<audio class="w-100 my-3" id="audio-preview-audio-${i}" controls>
  <source src="" id="audio-preview-source-${i}" />
</audio>`;

const uploadFeedback = (msg, textClass) => `
<p
  class="mt-2 mb-0 text-${textClass} text-center">
  ${msg}
</p>`;

const selectedMedia = ({media_content, name, id}) => {
  const description = media_content
    ? media_content.description
    : __('noDescription');

  return `
  <a
    href="#"
    data-media="${id}"
    class="selected-media list-group-item list-group-item-action flex-column align-items-start">
    <div class="d-flex w-100 justify-content-between">
      <div>
        <b class="mb-1 m-0">
          ${media_content ? media_content.title : name}
        </b>
        </br>
        <small class="mb-1">${description}</small>
      </div>
      <div class="selected-media-preview">
        <img src="${media_content.preview}">
      </div>
    </div>
  </a>
`;
}

module.exports = {
  templates: {
    mediaItem,
    paginationLoader,
    noMediasFound,
    tagItem,
    noTagsFound,
    tagsSelectOptions,
    tagsSelect,
    tagsLoader,
    uploadModalTitle,
    mediaPreview,
    noPreview,
    imagePreview,
    videoPreview,
    audioPreview,
    uploadPreview,
    uploadFeedback,
    metadataForm,
    selectedMedia,
  },
};
