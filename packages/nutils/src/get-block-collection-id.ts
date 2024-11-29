import type { Block, CollectionViewBlock, ExtendedRecordMap } from '@texonom/ntypes'

export function getBlockCollectionId(block: Block, recordMap: ExtendedRecordMap): string | null {
  const collectionId =
    (block as CollectionViewBlock).collection_id || (block as CollectionViewBlock).format?.collection_pointer?.id

  if (collectionId) return collectionId

  const collectionViewId = (block as CollectionViewBlock)?.view_ids?.[0]
  if (collectionViewId) {
    const collectionView = recordMap.collection_view?.[collectionViewId]?.value
    if (collectionView) {
      const collectionId = collectionView.format?.collection_pointer?.id
      return collectionId
    }
  }

  return null
}
