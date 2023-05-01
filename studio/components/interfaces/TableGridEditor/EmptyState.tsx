import { PermissionAction } from '@supabase/shared-types/out/constants'
import { checkPermissions, useLocalStorage } from 'hooks'
import { EXCLUDED_SCHEMAS } from 'lib/constants/schemas'
import { useTableEditorStateSnapshot } from 'state/table-editor'
import { useEntityTypesQuery } from 'data/entity-types/entity-types-infinite-query'
import ProductEmptyState from 'components/to-be-cleaned/ProductEmptyState'
import { useProjectContext } from 'components/layouts/ProjectLayout/ProjectContext'

export interface EmptyStateProps {
  onAddTable: () => void
}

const EmptyState = ({ onAddTable }: EmptyStateProps) => {
  const snap = useTableEditorStateSnapshot()
  const isProtectedSchema = EXCLUDED_SCHEMAS.includes(snap.selectedSchemaName)
  const canCreateTables =
    !isProtectedSchema && checkPermissions(PermissionAction.TENANT_SQL_ADMIN_WRITE, 'tables')

  const [sort] = useLocalStorage<'alphabetical' | 'grouped-alphabetical'>(
    'table-editor-sort',
    'alphabetical'
  )

  const { project } = useProjectContext()
  const { data } = useEntityTypesQuery(
    {
      projectRef: project?.ref,
      connectionString: project?.connectionString,
      schema: snap.selectedSchemaName,
      sort,
    },
    {
      keepPreviousData: true,
    }
  )

  const totalCount = data?.pages?.[0].data.count ?? 0

  return (
    <div className="w-full h-full flex items-center justify-center">
      {totalCount === 0 ? (
        <ProductEmptyState
          title="Table Editor"
          ctaButtonLabel={canCreateTables ? 'Create a new table' : undefined}
          onClickCta={canCreateTables ? onAddTable : undefined}
        >
          <p className="text-sm text-scale-1100">There are no tables available in this schema.</p>
        </ProductEmptyState>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <ProductEmptyState
            title="Table Editor"
            ctaButtonLabel={canCreateTables ? 'Create a new table' : undefined}
            onClickCta={canCreateTables ? onAddTable : undefined}
          >
            <p className="text-sm text-scale-1100">
              Select a table from the navigation panel on the left to view its data
              {canCreateTables && ', or create a new one.'}
            </p>
          </ProductEmptyState>
        </div>
      )}
    </div>
  )
}

export default EmptyState
