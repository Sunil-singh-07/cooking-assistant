import { useEffect, useCallback, useRef } from 'react'
import { supabase } from './supabase'

// ── Favorites ──────────────────────────────────────────────
export function useFavoritesSync(userId, favourites, setFavourites) {

  useEffect(() => {
    if (!userId) return
    supabase
      .from('favorites')
      .select('recipe_id')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data?.length) setFavourites(data.map(r => r.recipe_id))
      })
  }, [userId])

  const toggleFav = useCallback(async (recipe) => {
    const id = recipe?.id
    if (!id) return
    const isNowFav = !favourites.includes(id)
    setFavourites(prev => isNowFav ? [...prev, id] : prev.filter(f => f !== id))
    if (!userId) return
    try {
      if (isNowFav) {
        await supabase.from('favorites').upsert({
          user_id: userId, recipe_id: id,
          recipe_name: recipe.name || '', recipe_photo: recipe.photo || recipe._photo || null
        })
      } else {
        await supabase.from('favorites').delete()
          .eq('user_id', userId).eq('recipe_id', id)
      }
    } catch(e) { console.warn('Favorites sync failed:', e.message) }
  }, [userId, favourites, setFavourites])

  return { toggleFav }
}

// ── Recently Viewed ────────────────────────────────────────
export function useRecentlyViewedSync(userId, setRecentlyViewed) {

  useEffect(() => {
    if (!userId) return
    supabase
      .from('recently_viewed')
      .select('recipe_id, recipe_name, recipe_photo, viewed_at')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data?.length) setRecentlyViewed(data.map(r => ({
          id: r.recipe_id, name: r.recipe_name, photo: r.recipe_photo
        })))
      })
  }, [userId])

  const trackView = useCallback(async (recipe) => {
    if (!userId || !recipe?.id) return
    try {
      await supabase.from('recently_viewed').upsert({
        user_id: userId,
        recipe_id: String(recipe.id),
        recipe_name: recipe.name,
        recipe_photo: recipe.photo || recipe._photo || null,
        viewed_at: new Date().toISOString()
      }, { onConflict: 'user_id,recipe_id' })
    } catch(e) { console.warn('Recently viewed sync failed:', e.message) }
  }, [userId])

  return { trackView }
}

// ── Preferences — debounced save ──────────────────────────
export function usePreferencesSync(userId, activeMode, selectedPersona, setActiveMode, setPersona) {
  const didLoad = useRef(false)
  const saveTimer = useRef(null)

  // Load once on login
  useEffect(() => {
    if (!userId || didLoad.current) return
    didLoad.current = true
    supabase
      .from('preferences')
      .select('active_mode, persona')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.active_mode) setActiveMode(data.active_mode)
        if (data?.persona)     setPersona(data.persona)
      })
  }, [userId])

  // Save with 2s debounce so it doesn't flood on every render
  useEffect(() => {
    if (!userId || !didLoad.current) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      supabase.from('preferences').upsert({
        user_id: userId, active_mode: activeMode, persona: selectedPersona,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' }).catch(e => console.warn('Prefs save failed:', e.message))
    }, 2000)
    return () => clearTimeout(saveTimer.current)
  }, [userId, activeMode, selectedPersona])
}

// ── Custom AI Recipes ──────────────────────────────────────
export function useCustomRecipesSync(userId, setCustomRecipes) {

  useEffect(() => {
    if (!userId) return
    supabase
      .from('custom_recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data?.length) setCustomRecipes(data.map(r => ({
          ...r,
          ingredients: r.ingredients || [],
          steps: r.steps || []
        })))
      })
  }, [userId])

  const saveRecipe = useCallback(async (recipe, mode) => {
    if (!userId) return null
    try {
      const { data, error } = await supabase.from('custom_recipes').insert({
        user_id: userId,
        name: recipe.name, description: recipe.description,
        time: recipe.time || recipe.totalTime, difficulty: recipe.difficulty, mode,
        photo: recipe._photo || null,
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || []
      }).select().single()
      if (!error && data) {
        setCustomRecipes(prev => [data, ...prev])
        return data
      }
    } catch(e) { console.warn('Save recipe failed:', e.message) }
    return null
  }, [userId, setCustomRecipes])

  const deleteRecipe = useCallback(async (id) => {
    if (!userId) return
    try {
      await supabase.from('custom_recipes').delete().eq('id', id).eq('user_id', userId)
    } catch(e) { console.warn('Delete recipe failed:', e.message) }
    setCustomRecipes(prev => prev.filter(r => r.id !== id))
  }, [userId, setCustomRecipes])

  return { saveRecipe, deleteRecipe }
}