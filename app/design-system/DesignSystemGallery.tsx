'use client';

import { useState } from 'react';

import {
  Button,
  Card,
  IconButton,
  Input,
  Select,
  Skeleton,
  type SelectOption,
} from '@/components/ui';

const CURRENCY_SAMPLE: SelectOption[] = [
  { value: 'EUR', label: 'EUR', description: 'euro', meta: '€', keywords: ['Zona euro'] },
  { value: 'JPY', label: 'JPY', description: 'yen japonés', meta: '¥', keywords: ['Japón'] },
  { value: 'THB', label: 'THB', description: 'bat tailandés', meta: '฿', keywords: ['Tailandia'] },
  {
    value: 'USD',
    label: 'USD',
    description: 'dólar estadounidense',
    meta: '$',
    keywords: ['Estados Unidos'],
  },
  { value: 'VND', label: 'VND', description: 'dong vietnamita', meta: '₫', keywords: ['Vietnam'] },
];

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      {note && <p className="mt-0.5 mb-2 text-sm text-neutral-500">{note}</p>}
      <div className={note ? '' : 'mt-2'}>{children}</div>
    </section>
  );
}

export function DesignSystemGallery() {
  const [currency, setCurrency] = useState('THB');
  const [amount, setAmount] = useState('1890');

  return (
    <div className="mx-auto max-w-lg px-2 py-4 md:px-4">
      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Sistema de diseño
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Referencia interna. Cada primitiva en cada estado.
        </p>
      </header>

      <Section
        title="Button"
        note="Tres variantes, dos tamaños. Todos superan los 44 px de altura."
      >
        <Card className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
            <Button isLoading>Loading</Button>
          </div>
          <Button isFullWidth size="lg">
            Full width
          </Button>
        </Card>
      </Section>

      <Section title="IconButton" note="Etiqueta obligatoria. El hueco para la cámara futura.">
        <Card className="flex flex-wrap items-center gap-1">
          <IconButton label="Intercambiar monedas" variant="solid">
            <SwapIcon />
          </IconButton>
          <IconButton label="Intercambiar monedas" variant="subtle">
            <SwapIcon />
          </IconButton>
          <IconButton label="Intercambiar monedas" variant="ghost">
            <SwapIcon />
          </IconButton>
          <IconButton label="Escanear precio" variant="subtle">
            <CameraIcon />
          </IconButton>
          <IconButton label="Intercambiar monedas" disabled>
            <SwapIcon />
          </IconButton>
        </Card>
      </Section>

      <Section title="Input" note="Etiqueta siempre asociada. El slot final admite acciones.">
        <Card className="flex flex-col gap-2">
          <Input label="Etiqueta visible" placeholder="0" />
          <Input
            label="Importe"
            isEmphasised
            leading="฿"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          <Input label="Con pista" hint="Usa punto o coma como separador decimal" placeholder="0" />
          <Input
            label="Con acción final"
            placeholder="0"
            trailing={
              <IconButton label="Escanear precio" variant="ghost">
                <CameraIcon />
              </IconButton>
            }
          />
          <Input label="Deshabilitado" placeholder="0" disabled />
        </Card>
      </Section>

      <Section
        title="Select"
        note="Buscable por código, nombre y país. En móvil abre como hoja inferior."
      >
        <Card>
          <Select
            label="Moneda"
            value={currency}
            options={CURRENCY_SAMPLE}
            onChange={setCurrency}
            searchLabel="Buscar moneda o país"
            noResultsLabel="No se encontró ninguna moneda"
          />
        </Card>
      </Section>

      <Section title="Skeleton" note="Ocupa exactamente el espacio del contenido que sustituye.">
        <Card className="flex flex-col gap-1">
          {/* Widths are 8px units: w-12 is 96px, not 48px. */}
          <Skeleton className="h-2 w-12" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-2 w-8" />
        </Card>
      </Section>

      <Section title="Tipografía">
        <Card className="flex flex-col gap-1">
          <p className="text-display-sm tabular text-neutral-900">48,32 €</p>
          <p className="text-2xl font-semibold text-neutral-900">Título</p>
          <p className="text-lg font-medium text-neutral-900">Destacado</p>
          <p className="text-base text-neutral-700">Cuerpo de texto</p>
          <p className="text-sm text-neutral-500">Etiqueta secundaria</p>
          <p className="text-xs font-medium text-neutral-500">Marca de tiempo</p>
        </Card>
      </Section>

      <Section title="Color">
        <Card className="grid grid-cols-4 gap-1">
          {[
            ['bg-primary-600', 'primary'],
            ['bg-neutral-900', 'neutral'],
            ['bg-success-600', 'success'],
            ['bg-warning-600', 'warning'],
            ['bg-danger-600', 'danger'],
            ['bg-neutral-100', 'surface'],
            ['bg-primary-50', 'tint'],
            ['bg-neutral-200', 'border'],
          ].map(([className, name]) => (
            <div key={name} className="flex flex-col items-center gap-0.5">
              <div className={`h-5 w-full rounded-md ${className}`} />
              <span className="text-xs text-neutral-500">{name}</span>
            </div>
          ))}
        </Card>
      </Section>
    </div>
  );
}

function SwapIcon() {
  return (
    <svg className="size-2.5" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 4v13m0 0-3-3m3 3 3-3M17 20V7m0 0-3 3m3-3 3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg className="size-2.5" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.7l1.2-2h7.2l1.2 2h2.7A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-9Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
