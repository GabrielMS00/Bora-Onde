import { useState } from 'react';

import { CITIES } from '@/lib/cities';

import { BottomSheet } from './BottomSheet';
import { SelectField } from './SelectField';
import { ListOption, OptionList } from './Selectors';

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
      <BottomSheet visible={open} title="Cidade" onClose={() => setOpen(false)}>
        <OptionList>
          {CITIES.map((city) => (
            <ListOption
              key={city}
              type="radio"
              label={city}
              selected={value === city}
              onPress={() => {
                onChange(city);
                setOpen(false);
              }}
            />
          ))}
        </OptionList>
      </BottomSheet>
    </>
  );
}
