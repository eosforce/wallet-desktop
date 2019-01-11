<template>
    <a href="javascript:;" v-bind:class="_class" @click="click">
        <slot></slot>
    </a>
</template>
<script>
import {
    shell
} from 'electron'

export default {
    data () {
        return {

        }
    },
    props: {
        href: {
            type: String,
            default () {
                return '';
            }
        },
        _class: {
            type: String,
            default () {
                return '';
            }
        }
    },
    methods: {
        click () {
            shell.openExternal(this.href);
        }
    }
}
</script>