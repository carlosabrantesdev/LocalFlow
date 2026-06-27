import { themes } from './colors';

export const establishments = [
  {
    id: 'grao_aroma',
    name: 'Grão & Aroma',
    subtitle: 'Padaria local',
    initialMessage: 'Bem-vindo ao Grão & Aroma! Procurando o grão perfeito para o seu ritual matinal ou precisa de uma recomendação de acompanhamento?',
    recommendations: ['Horário de funcionamento', 'Produtos', 'Localização'],
    theme: themes.grao_aroma,
    bgImage: 'https://i.ibb.co/4wwWBFDd/794af74d-839f-40c0-8367-a9604dbe276d.png',
    logo: 'https://i.ibb.co/5ggBKwKk/310a99b8-72a9-410c-b273-07268610583f.png'
  },
  {
    id: 'academia_acao',
    name: 'Academia Ação',
    subtitle: 'Sua dose diária de energia',
    initialMessage: 'Olá! Pronto para transformar seu corpo e mente? Como posso ajudar você a alcançar seus objetivos de treino hoje?',
    recommendations: ['Planos de treino', 'Horários de funcionamento', 'Localização'],
    theme: themes.academia_acao,
    bgImage: 'https://i.ibb.co/VcqdsGP6/b1293865-e696-406a-a2bc-f4499208b8f2.png',
    logo: 'https://i.ibb.co/LdSxDbZK/67e2c9fd-f670-48ad-866b-8944ba4ed01c.png'
  },
  {
    id: 'clinica_sao_jorge',
    name: 'Clínica São Jorge',
    subtitle: 'Cuidado e saúde em primeiro lugar',
    initialMessage: 'Olá! Bem-vindo à Clínica São Jorge. Como podemos ajudar com a sua saúde hoje? Deseja agendar uma consulta ou tirar alguma dúvida?',
    recommendations: ['Agendar consulta', 'Especialidades', 'Localização', 'Horários de Funcionamento'],
    theme: themes.clinica_sao_jorge,
    bgImage: 'https://i.ibb.co/ccK6T8Bw/f329a248-59bd-47a5-b0f7-f19e28d19a50.png',
    logo: 'https://i.ibb.co/rR44w9c6/18b81385-4ffc-4320-8148-6f26862111f0.png'
  },
];
