import { Button, TextField } from '@/shared/ui'

export function SearchForm({ value, onChange, onSearch, canSearch }) {
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch()
      }}
    >
      <TextField
        id="article-number"
        label="Артикул"
        value={value}
        onChange={onChange}
        placeholder="Например, 01089"
        hint="Список производителей обновится после ввода"
        trailing={(
          <Button type="submit" variant="primary" disabled={!canSearch}>
            Поиск
          </Button>
        )}
      />
    </form>
  )
}
