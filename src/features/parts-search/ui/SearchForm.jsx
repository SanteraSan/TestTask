import { Button, TextField } from '@/shared/ui'

export function SearchForm({ value, onChange, onClear }) {
  return (
    <form role="search" onSubmit={(event) => event.preventDefault()}>
      <div className="row g-2 align-items-end">
        <div className="col-sm">
          <TextField
            id="article-number"
            label="Артикул"
            value={value}
            onChange={onChange}
            placeholder="Например, 01089"
            hint="Список производителей обновится после ввода"
          />
        </div>
        <div className="col-sm-auto">
          <Button variant="outline-secondary" onClick={onClear} disabled={!value}>
            Очистить
          </Button>
        </div>
      </div>
    </form>
  )
}
