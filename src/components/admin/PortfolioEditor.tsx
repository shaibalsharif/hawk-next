'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import ConfirmModal from './ConfirmModal'
import CategoryModal from './portfolio/CategoryModal'
import ItemModal from './portfolio/ItemModal'
import SortableCategoryCard from './portfolio/SortableCategoryCard'
import SortablePortfolioItemCard from './portfolio/SortablePortfolioItemCard'
import type { PortfolioCategory, PortfolioItem, PortfolioImage } from '@/types'

interface Props { initialCategories: PortfolioCategory[] }

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
}

export default function PortfolioEditor({ initialCategories }: Props) {
  const [cats, setCats] = useState<PortfolioCategory[]>(initialCategories)
  const [view, setView] = useState<'categories' | 'items'>('categories')
  const [direction, setDirection] = useState(1)
  const [selectedCat, setSelectedCat] = useState<PortfolioCategory | null>(null)
  const [editingCat, setEditingCat] = useState<Partial<PortfolioCategory> | null>(null)
  const [editingItem, setEditingItem] = useState<{ item: Partial<PortfolioItem>; catId: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; catId?: string; type: 'category' | 'item'; label: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [isDirtyCats, setIsDirtyCats] = useState(false)
  const [isDirtyItems, setIsDirtyItems] = useState(false)
  const [savingOrder, setSavingOrder] = useState<'cats' | 'items' | null>(null)
  const [orderMsg, setOrderMsg] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const flashOrder = (text: string) => {
    setOrderMsg(text)
    setTimeout(() => setOrderMsg(''), 3000)
  }

  const openCategory = (cat: PortfolioCategory) => {
    setDirection(1)
    setSelectedCat(cat)
    setView('items')
  }

  const goBack = () => {
    setDirection(-1)
    setView('categories')
  }

  const currentCat = cats.find((c) => c.id === selectedCat?.id) ?? selectedCat
  const items = currentCat ? (currentCat.items ?? []) : []

  const saveOrderCats = async () => {
    setSavingOrder('cats')
    try {
      await fetch('/api/content/portfolio', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category', order: cats.map((c, i) => ({ id: c.id, displayOrder: i })) }),
      })
      setIsDirtyCats(false)
      flashOrder('Category order saved!')
    } catch { flashOrder('Error saving order') }
    setSavingOrder(null)
  }

  const saveOrderItems = async () => {
    if (!currentCat) return
    setSavingOrder('items')
    try {
      await fetch('/api/content/portfolio', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'item', order: items.map((x, i) => ({ id: x.id, displayOrder: i })) }),
      })
      setIsDirtyItems(false)
      flashOrder('Item order saved!')
    } catch { flashOrder('Error saving order') }
    setSavingOrder(null)
  }

  const handleDragEndCats = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = cats.findIndex((c) => c.id === active.id)
    const newIdx = cats.findIndex((c) => c.id === over.id)
    setCats(arrayMove(cats, oldIdx, newIdx))
    setIsDirtyCats(true)
  }

  const handleDragEndItems = (event: DragEndEvent) => {
    if (!currentCat) return
    const { active, over } = event
    if (!over || active.id === over.id) return
    const catItems = currentCat.items ?? []
    const oldIdx = catItems.findIndex((x) => x.id === active.id)
    const newIdx = catItems.findIndex((x) => x.id === over.id)
    const reordered = arrayMove(catItems, oldIdx, newIdx)
    setCats((c) => c.map((cat) => cat.id === currentCat.id ? { ...cat, items: reordered } : cat))
    setIsDirtyItems(true)
  }

  const saveCat = async (data: Partial<PortfolioCategory>) => {
    if (editingCat?.id) {
      const res = await fetch(`/api/content/portfolio/${editingCat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category', data }),
      })
      const updated = await res.json()
      setCats((c) => c.map((x) => (x.id === editingCat.id ? { ...x, ...updated } : x)))
    } else {
      const res = await fetch('/api/content/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category', data }),
      })
      const created = await res.json()
      setCats((c) => [...c, { ...created, items: [] }])
    }
    setEditingCat(null)
  }

  const saveItem = async (data: Partial<PortfolioItem>) => {
    if (!editingItem) return
    const { catId } = editingItem
    if (editingItem.item.id) {
      const res = await fetch(`/api/content/portfolio/${editingItem.item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'item', data }),
      })
      const updated = await res.json()
      setCats((c) => c.map((cat) =>
        cat.id === catId
          ? { ...cat, items: (cat.items ?? []).map((x) => x.id === editingItem.item.id ? { ...x, ...updated, images: (data.images as PortfolioImage[]) ?? x.images } : x) }
          : cat
      ))
    } else {
      const res = await fetch('/api/content/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'item', data: { ...data, categoryId: catId } }),
      })
      const created = await res.json()
      setCats((c) => c.map((cat) => cat.id === catId ? { ...cat, items: [...(cat.items ?? []), created] } : cat))
    }
    setEditingItem(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    if (deleteTarget.type === 'category') {
      await fetch(`/api/content/portfolio/${deleteTarget.id}?type=category`, { method: 'DELETE' })
      setCats((c) => c.filter((x) => x.id !== deleteTarget.id))
      if (selectedCat?.id === deleteTarget.id) setView('categories')
    } else {
      await fetch(`/api/content/portfolio/${deleteTarget.id}?type=item`, { method: 'DELETE' })
      setCats((c) => c.map((cat) =>
        cat.id === deleteTarget.catId
          ? { ...cat, items: (cat.items ?? []).filter((x) => x.id !== deleteTarget.id) }
          : cat
      ))
    }
    setDeleting(false)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-oswald tracking-wider uppercase text-yellow-2">Portfolio</h2>
          <p className="text-xs text-white/40 mt-1">Manage categories and portfolio items</p>
        </div>
        <div className="flex items-center gap-2">
          {orderMsg && <span className="text-xs font-oswald tracking-wider text-green-400">{orderMsg}</span>}
          {view === 'categories' && isDirtyCats && (
            <button onClick={saveOrderCats} disabled={savingOrder === 'cats'}
              className="px-4 py-1.5 bg-dark-3 border border-yellow-2 text-yellow-2 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/10 transition-colors disabled:opacity-50">
              {savingOrder === 'cats' ? 'Saving…' : 'Save Order'}
            </button>
          )}
          {view === 'items' && isDirtyItems && (
            <button onClick={saveOrderItems} disabled={savingOrder === 'items'}
              className="px-4 py-1.5 bg-dark-3 border border-yellow-2 text-yellow-2 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/10 transition-colors disabled:opacity-50">
              {savingOrder === 'items' ? 'Saving…' : 'Save Order'}
            </button>
          )}
          {view === 'categories' && (
            <button onClick={() => setEditingCat({})}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Category
            </button>
          )}
          {view === 'items' && currentCat && (
            <button onClick={() => setEditingItem({ item: {}, catId: currentCat.id })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Item
            </button>
          )}
        </div>
      </div>

      {/* Sliding views */}
      <div className="relative overflow-hidden min-h-[200px]">
        <AnimatePresence mode="wait" custom={direction}>
          {view === 'categories' ? (
            <motion.div
              key="categories"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
            >
              {cats.length === 0 ? (
                <div className="bg-dark-2 rounded-lg py-16 text-center">
                  <svg className="w-10 h-10 text-white/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                  <p className="text-white/30 font-oswald tracking-widest uppercase text-sm">No categories yet</p>
                  <button onClick={() => setEditingCat({})} className="mt-4 text-xs text-yellow-2 font-oswald tracking-wider uppercase hover:text-yellow-2/70 transition-colors">
                    + Add your first category
                  </button>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCats}>
                  <SortableContext items={cats.map((c) => c.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cats.map((cat) => (
                        <SortableCategoryCard key={cat.id} cat={cat}
                          onOpen={() => openCategory(cat)}
                          onEdit={() => setEditingCat(cat)}
                          onDelete={() => setDeleteTarget({ id: cat.id, type: 'category', label: cat.name })}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`items-${currentCat?.id}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
            >
              {/* Back bar */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
                <button onClick={goBack} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-oswald tracking-wider uppercase">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  All Categories
                </button>
                <span className="text-white/20">/</span>
                <span className="text-sm font-oswald text-white tracking-wide">{currentCat?.name}</span>
                {currentCat && (
                  <div className="ml-auto flex items-center gap-2">
                    <button onClick={() => currentCat && setEditingCat(currentCat)} className="p-1.5 text-white/30 hover:text-yellow-2 transition-colors" title="Edit category">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </button>
                    <button onClick={() => currentCat && setDeleteTarget({ id: currentCat.id, type: 'category', label: currentCat.name })} className="p-1.5 text-white/30 hover:text-red-400 transition-colors" title="Delete category">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {items.length === 0 ? (
                <div className="bg-dark-2 rounded-lg py-16 text-center">
                  <p className="text-white/30 font-oswald tracking-widest uppercase text-sm">No items in this category</p>
                  <button onClick={() => currentCat && setEditingItem({ item: {}, catId: currentCat.id })} className="mt-4 text-xs text-yellow-2 font-oswald tracking-wider uppercase hover:text-yellow-2/70 transition-colors">
                    + Add first item
                  </button>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndItems}>
                  <SortableContext items={items.map((x) => x.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((item) => (
                        <SortablePortfolioItemCard key={item.id} item={item}
                          onEdit={() => currentCat && setEditingItem({ item, catId: currentCat.id })}
                          onDelete={() => currentCat && setDeleteTarget({ id: item.id, catId: currentCat.id, type: 'item', label: item.title })}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editingCat !== null && <CategoryModal cat={editingCat} onSave={saveCat} onClose={() => setEditingCat(null)} />}
        {editingItem !== null && <ItemModal item={editingItem.item} categoryId={editingItem.catId} onSave={saveItem} onClose={() => setEditingItem(null)} />}
      </AnimatePresence>

      <ConfirmModal
        open={deleteTarget !== null}
        title={deleteTarget?.type === 'category' ? 'Delete Category' : 'Delete Item'}
        message={
          deleteTarget?.type === 'category'
            ? `Delete category "${deleteTarget?.label}" and ALL its portfolio items? This cannot be undone.`
            : `Delete portfolio item "${deleteTarget?.label}" and all its gallery images? This cannot be undone.`
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
        danger
      />
    </div>
  )
}
