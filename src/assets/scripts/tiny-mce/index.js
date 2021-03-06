import tinymce from 'tinymce/tinymce';
import 'tinymce/themes/silver';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/table';
import 'tinymce/plugins/image';
import 'tinymce/plugins/preview';

var IconPicker = require('@furcan/iconpicker');

export default (function () {

    if (typeof window.tinymce === 'undefined') {
        window.tinymce = {};
    }

    tinymce.custom = {
        classes: {
            'tiny-mce-selector': '.tiny-mce',
            'note-modal-buttons': '.modal-note-details-buttons',
            'note-modal-delete': '.delete-note',
            'note-modal-edit': '.edit-note',
            'note-modal-save': '.save-note',
            'note-modal-content': ".modal-content",
            'note-modal-tinymce-content': ".modal-tinymce-body-", //requires id to this - added in function, cannot be used as standalone
            'modal': ".modal",
            'note-modal-title': '.note-title',
            'note-modal-category': '.note-category',
            'note-modal-categories-list': '.note-modal-categories-list',
            'note-wrapper': '.single-note-details',
            'modal-shadow': '.modal-backdrop',
            'note-button': '.note-button',
            prefixless: {
                'hidden': 'd-none'
            }
        },
        messages: {
            'note-delete-success': 'Note has been successfully deleted',
            'note-delete-fail': 'There was an error while deleting the note',
            'note-update-success': 'Note has been successfully updated',
            'note-update-fail': 'There was an error while updating the note',
            'note-save-fail': 'Cannot save note changes without editing it first!',
        },
        init: function () {
            let config = this.config;
            config.selector = tinymce.custom.classes["tiny-mce-selector"];
            tinymce.init(config);

            this.setDefaultTextAlignment();
            this.changeClearFormattingButtonLogic();

            this.MyNotes.attachEditEvent();
            this.MyNotes.attachSaveEvent();
            this.MyNotes.attachDeleteNoteEvent();
        },
        setDefaultTextAlignment: function () {
            $(document).ready(() => {
                let iframe_body = $('iframe').contents().find("body");

                $(iframe_body).on("DOMNodeInserted", function (event) {
                    $(event.target)
                        .addClass('left')
                        .css({"text-align": "left"})
                        .attr("data-mce-style", "text-align: left");
                });
            });
        },
        changeClearFormattingButtonLogic: function () {

        },
        config: {
            menubar: false,
            mode: "specific_textareas",
            plugins: ['lists', 'table', 'image', 'preview'],
            toolbar: 'bold italic | formatselect fontselect | forecolor colorpicker | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent | removeformat | image | preview',
            height: 400,
            forced_root_block: '',
            images_dataimg_filter: function(img) {
                return img.hasAttribute('internal-blob');
            },
            setup: function (ed) {
                ed.on('init', function () {
                    this.getDoc().body.style.fontSize = '12';
                    this.getDoc().body.style.fontFamily = 'Arial';
                });
                ed.on('change', function () {
                    tinymce.triggerSave();
                });
            },
        },
        "MyNotes": {
            init: function (editButton) {
                let modalContent = $(editButton).closest(tinymce.custom.classes["note-modal-content"]);
                let id = $(modalContent).closest(tinymce.custom.classes.modal).attr('data-id');

                let config = tinymce.custom.config;
                config.selector = tinymce.custom.classes["note-modal-tinymce-content"] + id;
                tinymce.init(config);
            },
            attachEditEvent: function () {
                let editButtons = tinymce.custom.classes["note-modal-edit"];

                $(editButtons).each((index, button) => {

                    $(button).click((event) => {

                        let clickedButton = event.target;
                        let modal = $(clickedButton).closest(tinymce.custom.classes.modal);
                        let noteTitle = $(modal).find(tinymce.custom.classes["note-modal-title"]);
                        let categoriesList = $(modal).find(tinymce.custom.classes["note-modal-categories-list"]);

                        if ($(categoriesList).hasClass(tinymce.custom.classes.prefixless.hidden)) {
                            $(categoriesList).removeClass(tinymce.custom.classes.prefixless.hidden);
                        }

                        $(noteTitle).attr('contenteditable', 'true');
                        $(noteTitle).css({'border-bottom': '1px rgba(0,0,0,0.2) solid'});

                        this.init(button);
                    })

                })
            },
            attachSaveEvent: function () {
                let saveButtons = tinymce.custom.classes["note-modal-save"];

                $(saveButtons).each((index, button) => {

                    $(button).click((event) => {
                        let clickedButton = event.target;
                        let modal = $(clickedButton).closest(tinymce.custom.classes.modal);
                        let tinymceModal = $(modal).find('iframe');

                        if (tinymceModal.length !== 0) {
                            let noteId = $(clickedButton).attr('data-id');
                            let noteBody = $(tinymceModal).contents().find('body').html();
                            let noteTitle = $(modal).find(tinymce.custom.classes["note-modal-title"]);
                            let noteCategoryId = $(modal).find(tinymce.custom.classes["note-modal-category"]).find(':selected');

                            let data = {
                                'id': noteId,
                                'body': noteBody,
                                'title': noteTitle.text(),
                                'category': {
                                    "type": "entity",
                                    'namespace': 'App\\Entity\\Modules\\Notes\\MyNotesCategories',
                                    'id': $(noteCategoryId).val(),
                                },
                            };

                            $.ajax({
                                method: 'POST',
                                url: '/my-notes/update/',
                                data: data,
                            }).done(() => {
                                bootstrap_notifications.notify(tinymce.custom.messages["note-update-success"], 'success');
                            }).fail(() => {
                                bootstrap_notifications.notify(tinymce.custom.messages["note-update-fail"], 'danger');
                            });

                        }

                    })

                })
            },
            attachDeleteNoteEvent: function () {
                let deleteButtons = tinymce.custom.classes["note-modal-delete"];
                let _this = this;
                $(deleteButtons).each((index, button) => {

                    $(button).click((event) => {
                        let clickedButton = event.target;
                        let noteId = $(clickedButton).attr('data-id');
                        let data = {
                            'id': noteId,
                        };

                        $.ajax({
                            method: 'POST',
                            url: '/my-notes/delete-note/',
                            data: data,
                        }).done(() => {
                            bootstrap_notifications.notify(tinymce.custom.messages["note-delete-success"], 'success');
                            $(clickedButton).closest(tinymce.custom.classes["note-wrapper"]).html("");
                            $(tinymce.custom.classes["modal-shadow"]).remove();

                            let allNotes = $(tinymce.custom.classes["note-button"]);

                            if ($(allNotes).length === 0) {
                                utils.window.redirect('/my-notes/create', 'There are no notes left in this category, You will be redirected in a moment');
                            }

                        }).fail(() => {
                            bootstrap_notifications.notify(tinymce.custom.messages["note-delete-fail"], 'danger');
                        });

                    })
                })
            }
        }
    };

}());
