import TaskItem from '@tiptap/extension-task-item'
import { mergeAttributes } from '@tiptap/core'

export const CustomTaskItem = TaskItem.extend({
  name: 'taskItem',

  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      checked: {
        default: false,
        parseHTML: element => element.getAttribute('data-checked') === 'true',
        renderHTML: attributes => ({
          'data-checked': attributes.checked,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'li',
        priority: 51,
        getAttrs: element => {
          if (element.getAttribute('data-type') !== 'taskItem') {
            return false
          }
          return {
            checked: element.getAttribute('data-checked') === 'true',
          }
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    // Renderiza sem o div extra - apenas o conteúdo direto
    return [
      'li',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'taskItem',
      }),
      0, // Renderiza o conteúdo diretamente aqui
    ]
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      // Criar a estrutura HTML personalizada
      const dom = document.createElement('li')
      dom.setAttribute('data-type', 'taskItem')
      dom.setAttribute('data-checked', String(node.attrs.checked))
      
      // Adicionar checkbox
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.checked = node.attrs.checked
      checkbox.style.marginRight = '0.5rem'
      checkbox.style.cursor = 'pointer'
      checkbox.addEventListener('change', (event) => {
        const checked = (event.target as HTMLInputElement).checked
        if (typeof getPos === 'function') {
          editor.commands.updateAttributes('taskItem', { checked })
        }
      })
      
      // Adicionar o conteúdo
      const contentWrapper = document.createElement('span')
      contentWrapper.style.display = 'inline'
      contentWrapper.style.verticalAlign = 'middle'
      
      dom.appendChild(checkbox)
      dom.appendChild(contentWrapper)
      
      return {
        dom,
        contentDOM: contentWrapper,
        update: (updatedNode) => {
          if (updatedNode.type !== this.type) {
            return false
          }
          
          dom.setAttribute('data-checked', String(updatedNode.attrs.checked))
          checkbox.checked = updatedNode.attrs.checked
          
          return true
        },
      }
    }
  },
})