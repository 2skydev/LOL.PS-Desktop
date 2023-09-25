import { ChangeEvent, useCallback, useEffect } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Input, Table } from 'antd'
import clsx from 'clsx'
import { includesByCho, correctByDistance } from 'hangul-util'
import { useAtom, useAtomValue } from 'jotai'
import { debounce } from 'lodash'

import { CHAMPION_NAME_ALIAS_MAP } from '@main/modules/league/league.constants'
import { LaneId } from '@main/modules/league/types/lane.types'
import {
  DuoSynergyItem,
  DuoSynergyItemChampion,
  GetDuoSynergyListOptions,
} from '@main/modules/ps/types/duo.types'

import ChampionProfileSmall from '@renderer/features/champion/ChampionProfileSmall'
import DuoLaneSelect, { DuoId } from '@renderer/features/duo/DuoLaneSelect'
import useDuoLaneOptions from '@renderer/features/duo/DuoLaneSelect/hooks/useDuoLaneOptions'
import { duoSynergyTableDuoIdAtom } from '@renderer/features/duo/DuoSynergyTable/atoms/duoSynergyTableDuoId.atom'
import LaneIcon from '@renderer/features/lane/LaneIcon'
import RankRangeSelect from '@renderer/features/rank/RankRangeSelect'
import { rankRangeIdAtom } from '@renderer/features/rank/RankRangeSelect/atoms/rankRangeId.atom'
import useAPI from '@renderer/hooks/useAPI'
import useCustomForm from '@renderer/hooks/useCustomForm'
import useDidUpdateEffect from '@renderer/hooks/useDidUpdateEffect'

import * as Styled from './DuoSynergyTable.styled'

export interface DuoSynergyTableProps {
  className?: string
}

export interface DuoSynergyForm extends Omit<GetDuoSynergyListOptions, 'championId'> {
  duoId: DuoId
  championId: number | null
  search: string
}

export interface FilteredChampionItem {
  id: number
  name: string
  normalizedName: string
  alias: string[]
}

const DuoSynergyTable = ({ className }: DuoSynergyTableProps) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'renderer.stats',
  })

  const options = useDuoLaneOptions()

  const [duoSynergyTableDuoId, setDuoSynergyTableDuoId] = useAtom(duoSynergyTableDuoIdAtom)

  const form = useCustomForm<DuoSynergyForm>({
    defaultValues: {
      duoId: duoSynergyTableDuoId,
      criterion: 'synergyScore',
      order: 'desc',
      championId: null,
      search: '',
    },
    onSubmit: () => {},
  })

  const duoId = form.watch('duoId')
  const criterion = form.watch('criterion')
  const order = form.watch('order')
  const championId = form.watch('championId')
  const search = form.watch('search')
  const rankRangeId = useAtomValue(rankRangeIdAtom)

  const { data: championNames, isLoading: isChampionNamesLoading } = useAPI('getChampionNames', {
    revalidateIfStale: false,
  })

  const { data = [], isLoading: isDuoSynergyListLoading } = useAPI('getDuoSynergyList', {
    dedupingInterval: 1000 * 60 * 5,
    params: [
      duoId,
      {
        rankRangeId,
        criterion,
        order,
        championId: championId ?? undefined,
      },
    ],
  })

  const isLoading = isDuoSynergyListLoading || isChampionNamesLoading

  const handleChangeSearch = useCallback(
    debounce((e: ChangeEvent<HTMLInputElement>) => {
      form.setValue('search', e.target.value)
    }, 200),
    [],
  )

  useDidUpdateEffect(() => {
    setDuoSynergyTableDuoId(duoId)
  }, [duoId])

  useEffect(() => {
    const filteredChampions =
      !championNames || !search.trim().length
        ? []
        : Object.keys(championNames).reduce<FilteredChampionItem[]>((acc, id) => {
            const name = championNames[id].ko
            const normalizedName = name.replaceAll(' ', '')
            const alias = CHAMPION_NAME_ALIAS_MAP[normalizedName] ?? []

            if (
              includesByCho(search, normalizedName) ||
              alias.some(x => includesByCho(search, x))
            ) {
              acc.push({
                id: +id,
                name,
                normalizedName,
                alias,
              })
            }

            return acc
          }, [])

    const distanceChampionNames: string[] = correctByDistance(
      search,
      filteredChampions.map(x => x.normalizedName),
    )

    const filteredChampionId: number | null = distanceChampionNames.length
      ? filteredChampions.find(x => x.normalizedName === distanceChampionNames[0])!.id
      : filteredChampions.length === 1
      ? filteredChampions[0].id
      : null

    if (championId !== filteredChampionId) {
      form.setValue('championId', filteredChampionId)
    } else if (!filteredChampions.length && championId !== null) {
      form.setValue('championId', null)
    }
  }, [championNames, search, championId])

  return (
    <Styled.Root className={clsx('DuoSynergyTable', className)}>
      <header>
        <h2>{t('duoSynergy.title')}</h2>
      </header>

      <div className="arguments">
        <Controller
          control={form.control}
          name="duoId"
          render={({ field }) => <DuoLaneSelect {...field} />}
        />

        <Input
          className="search"
          placeholder={t('duoSynergy.searchPlaceholder')}
          onChange={handleChangeSearch}
        />

        <RankRangeSelect />
      </div>

      <br />

      <Table
        columns={[
          {
            key: 'ranking',
            dataIndex: 'ranking',
            title: t('duoSynergy.tableColumns.ranking'),
            align: 'center',
            width: 80,
          },
          {
            key: 'champion',
            title: <DuoSynergyTableLaneTitle laneId={options[duoId][0]} />,
            render: (record: DuoSynergyItem) => {
              return <DuoSynergyTableChampProfile {...record.champion1} />
            },
          },
          {
            key: 'champion',
            title: <DuoSynergyTableLaneTitle laneId={options[duoId][1]} />,
            render: (record: DuoSynergyItem) => {
              return <DuoSynergyTableChampProfile {...record.champion2} />
            },
          },
          {
            key: 'synergyScore',
            dataIndex: 'synergyScore',
            title: t('duoSynergy.tableColumns.synergyScore'),
            align: 'right',
            sorter: (a, b) => a.synergyScore - b.synergyScore,
            sortOrder:
              criterion === 'synergyScore' ? (order === 'desc' ? 'descend' : 'ascend') : null,
            width: 200,
          },
          {
            key: 'duoWinrate',
            dataIndex: 'duoWinrate',
            title: t('duoSynergy.tableColumns.winRate'),
            align: 'right',
            sorter: (a, b) => a.duoWinrate - b.duoWinrate,
            sortOrder:
              criterion === 'duoWinrate' ? (order === 'desc' ? 'descend' : 'ascend') : null,
            render: (value: number) => value + '%',
            width: 140,
          },
          {
            key: 'pickrate',
            dataIndex: 'pickrate',
            title: t('duoSynergy.tableColumns.pickRate'),
            align: 'right',
            sorter: (a, b) => a.pickrate - b.pickrate,
            sortOrder: criterion === 'pickrate' ? (order === 'desc' ? 'descend' : 'ascend') : null,
            render: (value: number) => value + '%',
            width: 140,
          },
          {
            key: 'count',
            dataIndex: 'count',
            title: t('sampledCount'),
            align: 'right',
            sorter: (a, b) => a.count - b.count,
            sortOrder: criterion === 'count' ? (order === 'desc' ? 'descend' : 'ascend') : null,
            render: (value: number) => value.toLocaleString(),
            width: 140,
          },
        ]}
        dataSource={data}
        rowKey={record => `${record.champion1.championId}.${record.champion2.championId}`}
        loading={isLoading}
        pagination={false}
        scroll={{ y: 600 }}
        sortDirections={['descend', 'ascend']}
        onChange={(_, __, sorter) => {
          if (!Array.isArray(sorter)) {
            form.setValue('criterion', sorter.columnKey as DuoSynergyForm['criterion'])
            form.setValue('order', sorter.order === 'ascend' ? 'asc' : 'desc')
          }
        }}
      />
    </Styled.Root>
  )
}

export const DuoSynergyTableChampProfile = ({
  championId,
  winrate,
  championName,
}: DuoSynergyItemChampion) => {
  const navigate = useNavigate()

  return (
    <Styled.ChampionProfile
      onClick={() => {
        navigate(`/champions/${championId}`)
      }}
    >
      <ChampionProfileSmall championId={championId} />

      <div className="texts">
        <div className="winRate">{winrate}%</div>
        <div className="name">{championName}</div>
      </div>
    </Styled.ChampionProfile>
  )
}

export const DuoSynergyTableLaneTitle = ({ laneId }: { laneId: LaneId }) => {
  const { t } = useTranslation()

  const labels = t('league.laneId', { returnObjects: true })

  return (
    <Styled.LaneTitle>
      <LaneIcon laneId={laneId} /> {labels[laneId]} {t('renderer.stats.winRate')}
    </Styled.LaneTitle>
  )
}

export default DuoSynergyTable
