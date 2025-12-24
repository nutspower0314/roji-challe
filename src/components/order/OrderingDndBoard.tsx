import { useEffect, useState } from 'react';

type OrderingDndBoardProps = {
  order: Array<string | null>;
  onChange: (order: Array<string | null>) => void;
};

const RANKS = ['1位', '2位', '3位'] as const;
const ITEMS = ['A', 'B', 'C'] as const;

type DragPayload = {
  itemId: string;
  fromIndex: number;
};

const parsePayload = (data: string): DragPayload | null => {
  const [itemId, fromIndexRaw] = data.split('|');
  if (!itemId) return null;
  const fromIndex = Number(fromIndexRaw);
  return { itemId, fromIndex: Number.isNaN(fromIndex) ? -1 : fromIndex };
};

export function OrderingDndBoard({ order, onChange }: OrderingDndBoardProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverPool, setDragOverPool] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const remainingItems = ITEMS.filter((item) => !order.includes(item));

  const handleTapSelect = (itemId: string) => {
    setSelectedItem((prev) => (prev === itemId ? null : itemId));
  };

  const handleTapDropOnSlot = (index: number) => {
    if (!selectedItem) return;
    handleDropOnSlot(index, { itemId: selectedItem, fromIndex: -1 });
  };

  const handleTapDropOnPool = () => {
    if (!selectedItem) return;
    handleDropOnPool({ itemId: selectedItem, fromIndex: -1 });
    setSelectedItem(null);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(pointer: coarse)');
    const update = () => setIsCoarsePointer(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => {
      media.removeEventListener?.('change', update);
    };
  }, []);

  const handleDropOnSlot = (index: number, payload: DragPayload | null) => {
    if (!payload) return;
    const next = [...order];
    const currentIndex = next.findIndex((item) => item === payload.itemId);
    const targetExisting = next[index];

    if (currentIndex !== -1 && currentIndex !== index) {
      next[currentIndex] = null;
    }

    if (targetExisting && currentIndex !== -1) {
      next[currentIndex] = targetExisting;
    }

    next[index] = payload.itemId;
    onChange(next);
    if (isCoarsePointer) setSelectedItem(null);
  };

  const handleDropOnPool = (payload: DragPayload | null) => {
    if (!payload) return;
    const next = [...order];
    const currentIndex = next.findIndex((item) => item === payload.itemId);
    if (currentIndex !== -1) {
      next[currentIndex] = null;
    }
    onChange(next);
    if (isCoarsePointer) setSelectedItem(null);
  };

  return (
    <section className="ordering-board">
      {isCoarsePointer && (
        <div className="ordering-touch-hint">
          配置済みはタップで候補に戻せます
        </div>
      )}
      <div className="ordering-board__slots">
        {RANKS.map((rank, index) => {
          const item = order[index];
          return (
            <div
              key={rank}
              className={`ordering-slot ${
                dragOverIndex === index ? 'ordering-slot--over' : ''
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOverIndex(index);
                setDragOverPool(false);
              }}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={(event) => {
                event.preventDefault();
                const payload = parsePayload(event.dataTransfer.getData('text/plain'));
                handleDropOnSlot(index, payload);
                setDragOverIndex(null);
              }}
              onClick={() => {
                if (isCoarsePointer) handleTapDropOnSlot(index);
              }}
            >
              <div className="ordering-slot__label">{rank}</div>
              {item ? (
                <div
                  className="ordering-card"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData(
                      'text/plain',
                      `${item}|${index}`,
                    );
                  }}
                  onClick={() => {
                    if (!isCoarsePointer) return;
                    const next = order.map((value, i) =>
                      i === index ? null : value,
                    );
                    onChange(next);
                  }}
                >
                  {item}
                </div>
              ) : (
                <div className="ordering-slot__empty">
                  {isCoarsePointer ? 'タップで配置' : 'ここにドロップ'}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div
        className={`ordering-pool ${
          dragOverPool ? 'ordering-pool--over' : ''
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOverPool(true);
          setDragOverIndex(null);
        }}
        onDragLeave={() => setDragOverPool(false)}
        onDrop={(event) => {
          event.preventDefault();
          const payload = parsePayload(event.dataTransfer.getData('text/plain'));
          handleDropOnPool(payload);
          setDragOverPool(false);
        }}
        onClick={() => {
          if (isCoarsePointer) handleTapDropOnPool();
        }}
      >
        <div className="ordering-pool__label">候補</div>
        <div className="ordering-pool__items">
          {remainingItems.map((item) => (
            <div
              key={item}
              className={`ordering-card ordering-card--pool ${
                selectedItem === item ? 'ordering-card--selected' : ''
              }`}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('text/plain', `${item}|-1`);
              }}
              onClick={() => {
                if (isCoarsePointer) handleTapSelect(item);
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="ordering-pool__hint">
          {isCoarsePointer
            ? '候補をタップ → 入れたい順位をタップで配置'
            : 'ここにドラッグすると戻せます'}
        </div>
      </div>
    </section>
  );
}
