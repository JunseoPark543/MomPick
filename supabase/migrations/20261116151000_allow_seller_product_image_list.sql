-- 판매자가 자기 업체 상품 사진을 Storage API로 확인·삭제할 수 있게 한다.
-- 기존 업로드·삭제 권한과 같은 업체 폴더 검사 함수를 사용한다.
create policy "업체 담당자가 자기 상품 사진 보기"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'product-images'
    and public.can_manage_product_folder((storage.foldername(name))[1])
  );
