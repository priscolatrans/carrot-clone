import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useSWRConfig } from 'swr';
import useSWRImmutable from 'swr/immutable';
import Link from 'next/link';
import Image from 'next/image';
// components
import Appbar from '@components/Layout/Appbar';
// api
import { getProductDetail } from 'src/api/product';
import { updateFavorite } from 'src/api/favorite';
import { createChat } from 'src/api/chat';
// lib
import { currencify, getPrevDate } from '@libs/format';
// style
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import {
  DetailContainer,
  DetailContent,
  DetailImage,
  DetailProfileContainer,
  DetailProfileImage,
  DetailProfileContent,
  TabbarContainer,
  TabbarWrap,
  TabbarItemBox,
} from 'assets/pages/products/detail/styles';
import { ProductDetailStructure } from '@libs/type/product_type';

const ItemDetail = () => {
  const router = useRouter();
  const product_detail = useSWRImmutable<ProductDetailStructure>(`/api/products/${router.query.id}`, () =>
    getProductDetail(router.query.id as string),
  );
  const { mutate } = useSWRConfig();
  const [toggle_fav, set_toggle_fav] = useState(product_detail.data ? product_detail.data.isLiked : false);

  useEffect(() => {
    if (!product_detail.data) return;

    set_toggle_fav(product_detail.data.isLiked);
  }, [product_detail]);

  if (product_detail.error) return <div>...error</div>;
  if (!product_detail.data) return <div>...loading</div>;

  const onUpdateFav = () => {
    updateFavorite(router.query.id as string)
      .then(() => {
        set_toggle_fav(!toggle_fav);
        mutate(`/api/products`);
      })
      .catch((e) => {
        console.error(e);
        alert('Failed to Favorite');
      });
  };

  const isMyProduct = () => {
    if(!product_detail.data) return;

    if(product_detail.data.product.userId === product_detail.data.product.user.id) return true;
    else return false;
  }

  const onCreateChat = () => {
    if (isMyProduct()) {
      router.push('/');
      return;
    }
    createChat(product_detail.data?.product.id as number)
      .then((v) => {
        alert('Success Create ChatRoom');
        router.push(`/chats/${v.id}?chat_id${v.id}&product_id=${v.productId}`);
      })
      .catch((v) => {
        console.log(v);
        alert('Failed to Create ChatRoom');
      });
  };

  return (
    <>
      <Appbar />
      <DetailContainer>
        {/* 상품 이미지 */}
        <DetailImage>
          <Image
            src={`${process.env.NEXT_PUBLIC_CF_IMAGE}/${product_detail.data?.product?.image}/public`}
            width={280}
            height={280}
            alt=""
            layout="responsive"
          />
        </DetailImage>
        {/* 프로필 관련 */}
        <DetailProfileContainer>
          <DetailProfileImage>
            <Image
              src={
                product_detail.data.product.user.avatar
                  ? `${process.env.NEXT_PUBLIC_CF_IMAGE}/${product_detail.data?.product?.user?.avatar}/avatar`
                  : `${process.env.NEXT_PUBLIC_CF_IMAGE}/74514a95-ce9a-471d-b000-b927ff295500/avatar`
              }
              alt="사람들이 올린 프로필 이미지 동그란 모양"
              layout="fill"
              style={{ borderRadius: '50%' }}
            />
          </DetailProfileImage>
          <DetailProfileContent>
            <strong>{product_detail.data.product.user.name}</strong>
          </DetailProfileContent>
        </DetailProfileContainer>
        <DetailContent className="mt-5">
          <strong>{product_detail.data.product.name}</strong>
          <b>{getPrevDate(product_detail.data.product.createdAt)}</b>
          <p>{product_detail.data.product.description}</p>
        </DetailContent>
      </DetailContainer>
      {/* 가격 및 채팅 */}
      <TabbarContainer>
          <TabbarWrap>
            <TabbarItemBox>
              <button onClick={onUpdateFav}>
                <FavoriteBorderIcon style={{ fill: toggle_fav ? 'red' : 'black' }} />
              </button>
              <p>{currencify(product_detail.data.product.price)}원</p>
            </TabbarItemBox>
            <TabbarItemBox>
              <button style={{ width: '140px', height: '40px' }} onClick={onCreateChat}>
                {isMyProduct() ? '채팅 목록으로' : '채팅하기'}
              </button>
            </TabbarItemBox>
          </TabbarWrap>
      </TabbarContainer>
    </>
  );
};

export default ItemDetail;
