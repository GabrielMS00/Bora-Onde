import { useState } from 'react';

import { CITIES } from '@/lib/cities';

import { BottomSheet } from './BottomSheet';
import { SelectField } from './SelectField';
import { ListOption, OptionList } from './Selectors';

type SheetProps = {
  visible: boolean;
  value?: string;
  onSelect: (city: string) => void;
  onClose: () => void;
};

export function CitySheet({ visible, value, onSelect, onClose }: SheetProps) {
  return (
    <BottomSheet visible={visible} title="Cidade" onClose={onClose}>
      <OptionList>
        {CITIES.map((city) => (
          <ListOption key={city} type="radio" label={city} selected={value === city} onPress={() => onSelect(city)} />
        ))}
      </OptionList>
    </BottomSheet>
  );
}

type Props = {
  value?: string;
  onChange: (city: string) => void;
  error?: string;
  label?: string;
};

export function CityField({ value, onChange, error, label = 'Cidade' }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SelectField label={label} value={value || undefined} placeholder="Selecione sua cidade" error={error} onPress={() => setOpen(true)} />
      <CitySheet
        visible={open}
        value={value}
        onSelect={(city) => {
          onChange(city);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
